interface ProcessPromptMessage {
  type: 'PROCESS_PROMPT';
  prompt: string;
  pageDom: string;
}

interface SaveFormDataMessage {
  type: 'SAVE_FORM_DATA';
  formData: {
    url: string;
    timestamp: string;
    fields: {
      [key: string]: {
        value: string;
        selector: string;
        label: string;
        type: string;
      };
    };
  };
}

interface FormField {
  selector: string;
  value: string;
  display_name: string;
}

type Message = ProcessPromptMessage | SaveFormDataMessage;

// Retry logic for API calls
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, backoff = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, backoff));
    return retryWithBackoff(fn, retries - 1, backoff * 2);
  }
}

// Save form data to storage
async function saveFormData(formData: SaveFormDataMessage['formData']): Promise<void> {
  try {
    const { savedForms = [] } = await chrome.storage.local.get(['savedForms']);
    
    // Add timestamp and page URL to the form data
    const enhancedFormData = {
      ...formData,
      timestamp: new Date().toISOString(),
      url: formData.url || 'unknown'
    };
    
    // Keep last 50 forms
    const updatedForms = [enhancedFormData, ...savedForms].slice(0, 50);
    
    await chrome.storage.local.set({ savedForms: updatedForms });
    
    // Update user info with form field values
    const { userInfo = {} } = await chrome.storage.local.get(['userInfo']);
    const updatedUserInfo = { ...userInfo };
    
    Object.entries(formData.fields).forEach(([_, field]) => {
      if (field.label && field.value) {
        const cleanLabel = field.label
          .replace(/([A-Z])/g, ' $1')
          .replace(/[_-]/g, ' ')
          .trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        updatedUserInfo[cleanLabel] = field.value;
      }
    });
    
    await chrome.storage.local.set({ userInfo: updatedUserInfo });
  } catch (error) {
    console.error('Error in saveFormData:', error);
    throw error;
  }
}

async function handleLLMCall(message: ProcessPromptMessage): Promise<{ fields: FormField[] }> {
  try {
    // Get the user's API key and saved forms
    const { openaiApiKey, savedForms = [] } = await chrome.storage.local.get(['openaiApiKey', 'savedForms']);
    
    if (!openaiApiKey) {
      throw new Error('No API key found. Please set your OpenAI API key in the extension options.');
    }
    
    // Format saved form data as a readable string
    const savedFormData = JSON.stringify(savedForms, null, 2);
    
    // Load the system instruction
    const response = await fetch(chrome.runtime.getURL('prompt.md'));
    if (!response.ok) {
      throw new Error('Failed to load prompt template');
    }
    const systemInstruction = await response.text();
    
    // Replace template variables
    const filledSystemInstruction = systemInstruction
      .replace('${userPrompt}', message.prompt)
      .replace('${pageDom}', message.pageDom)
      .replace('${savedFormData}', savedFormData);
    
    // Send request to OpenAI with retry logic
    const makeRequest = async () => {
      const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: filledSystemInstruction }
          ],
          temperature: 0.8,
          max_tokens: 1024,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          response_format: { type: 'json_object' }
        })
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      return apiResponse.json();
    };
    
    const data = await retryWithBackoff(makeRequest);
    const llmResponse = data.choices[0].message.content;
    
    // Validate JSON response
    const parsed = JSON.parse(llmResponse);
    if (!parsed.fields || !Array.isArray(parsed.fields)) {
      throw new Error('Invalid response format: missing or invalid fields array');
    }
    
    // Validate each field
    parsed.fields.forEach((field: FormField, index: number) => {
      if (!field.selector || !field.value || !field.display_name) {
        throw new Error(`Invalid field format at index ${index}`);
      }
    });
    
    return parsed;
  } catch (error) {
    console.error('Error in handleLLMCall:', error);
    throw error;
  }
}

chrome.runtime.onMessage.addListener((
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  if (message.type === 'PROCESS_PROMPT') {
    handleLLMCall(message)
      .then(response => sendResponse({ success: true, ...response }))
      .catch(error => sendResponse({ 
        success: false, 
        error: error.message,
        details: error.stack
      }));
    return true; // Will respond asynchronously
  } else if (message.type === 'SAVE_FORM_DATA') {
    saveFormData(message.formData)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ 
        success: false, 
        error: error.message 
      }));
    return true; // Will respond asynchronously
  }
  return false;
}); 