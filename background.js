// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('=== Background Script: Message Received ===', {
    type: message.type,
    sender: sender.tab ? sender.tab.url : 'popup'
  });
  
  if (message.type === 'CALL_LLM') {
    handleLLMCall(message, sendResponse);
    return true; // Will respond asynchronously
  } else if (message.type === 'SAVE_FORM_DATA') {
    console.log('Saving form data:', message.formData);
    saveFormData(message.formData).catch(error => {
      console.error('Error saving form data:', error);
    });
    sendResponse({ success: true });
    return false;
  }
});

// Save form data to storage
async function saveFormData(formData) {
  console.log('=== START: saveFormData ===');
  console.log('Form data to save:', formData);
  
  try {
    const { savedForms = [] } = await new Promise((resolve, reject) => {
      chrome.storage.local.get(['savedForms'], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
    
    console.log('Current saved forms count:', savedForms.length);
    
    // Validate form data
    if (!formData || typeof formData !== 'object') {
      throw new Error('Invalid form data format');
    }
    
    // Add timestamp and page URL to the form data
    const enhancedFormData = {
      ...formData,
      timestamp: new Date().toISOString(),
      url: formData.url || 'unknown'
    };
    
    // Keep last 50 forms
    const updatedForms = [enhancedFormData, ...savedForms].slice(0, 50);
    console.log('New forms count:', updatedForms.length);
    
    await new Promise((resolve, reject) => {
      chrome.storage.local.set({ savedForms: updatedForms }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
    
    console.log('=== END: saveFormData ===\n');
  } catch (error) {
    console.error('Error in saveFormData:', error);
    throw error;
  }
}

// Retry logic for API calls
async function retryWithBackoff(fn, retries = 3, backoff = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    await new Promise(resolve => setTimeout(resolve, backoff));
    return retryWithBackoff(fn, retries - 1, backoff * 2);
  }
}

async function handleLLMCall(message, sendResponse) {
  console.log('=== START: handleLLMCall ===');
  try {
    // 1. Get the user's API key and saved forms from local storage
    console.log('Fetching API key and saved forms from storage');
    const { openaiApiKey, savedForms = [] } = await new Promise((resolve, reject) => {
      chrome.storage.local.get(['openaiApiKey', 'savedForms'], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });

    if (!openaiApiKey) {
      console.error('No API key found');
      throw new Error('No API key found. Please set your OpenAI API key in the extension options.');
    }

    // 2. Prepare the prompt
    const userPrompt = message.userPrompt;
    const pageDom = message.pageDom;
    console.log('User prompt:', userPrompt);
    console.log('Page DOM length:', pageDom.length);
    
    // Format saved form data as a readable string
    const savedFormData = JSON.stringify(savedForms, null, 2);
    console.log('Saved form data length:', savedFormData.length);

    // Read the system instruction from prompt.md
    console.log('Loading prompt template');
    const response = await fetch(chrome.runtime.getURL('prompt.md'));
    if (!response.ok) {
      throw new Error('Failed to load prompt template');
    }
    const systemInstruction = await response.text();
    
    // Replace template variables
    const filledSystemInstruction = systemInstruction
      .replace('${userPrompt}', userPrompt)
      .replace('${pageDom}', pageDom)
      .replace('${savedFormData}', savedFormData);

    console.log('Sending request to OpenAI...');
    console.log('System instruction length:', filledSystemInstruction.length);

    // 3. Send request to OpenAI with retry logic
    const makeRequest = async () => {
      const apiUrl = "https://api.openai.com/v1/chat/completions";
      const requestBody = {
        model: "gpt-4o",
        messages: [
          { role: "system", content: filledSystemInstruction }
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: {
          type: "json_object"
        }
      };

      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      return apiResponse.json();
    };

    const data = await retryWithBackoff(makeRequest);
    console.log('OpenAI response:', data);

    const llmResponse = data.choices[0].message.content;
    console.log('LLM response:', llmResponse);

    // Validate JSON response
    const parsed = JSON.parse(llmResponse);
    if (!parsed.fields || !Array.isArray(parsed.fields)) {
      throw new Error('Invalid response format: missing or invalid fields array');
    }
    
    // Validate each field
    parsed.fields.forEach((field, index) => {
      if (!field.selector || !field.value || !field.display_name) {
        throw new Error(`Invalid field format at index ${index}`);
      }
    });
    
    console.log('Parsed and validated LLM response:', parsed);

    sendResponse({ success: true, llmResponse });
  } catch (error) {
    console.error('Error in handleLLMCall:', error);
    sendResponse({ 
      success: false, 
      error: error.message,
      details: error.stack
    });
  }
  console.log('=== END: handleLLMCall ===\n');
} 