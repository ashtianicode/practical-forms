(function() {
  // --- 1. Create floating button ---
  const btn = document.createElement('div');
  btn.id = 'practical-forms-btn';
  btn.textContent = 'Practical Form';
  
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '0 20px',
    height: '50px',
    borderRadius: '4px',
    background: '#F5F5F1',
    border: '2px solid rgb(134,58,74)',
    color: 'rgb(134,58,74)',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 999999,
    fontWeight: 'bold',
    fontSize: '16px',
    boxShadow: '3px 3px 0 rgb(134,58,74)'
  });
  document.body.appendChild(btn);

  // Check initial visibility state
  chrome.storage.local.get(['showFloatingButton'], (result) => {
    const showFloatingButton = result.showFloatingButton ?? true; // Default to true
    btn.style.display = showFloatingButton ? 'flex' : 'none';
  });

  // Listen for toggle messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_FLOATING_BUTTON') {
      btn.style.display = message.show ? 'flex' : 'none';
      if (!message.show) {
        panel.style.display = 'none'; // Hide panel if button is hidden
      }
    }
  });

  // --- 2. Create chat panel ---
  const panel = document.createElement('div');
  panel.id = 'practical-forms-panel';
  Object.assign(panel.style, {
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    width: '350px',
    height: '500px',
    background: '#F5F5F1',
    border: '2px solid rgb(134,58,74)',
    borderRadius: '4px',
    boxShadow: '3px 3px 0 rgb(134,58,74)',
    display: 'none',
    flexDirection: 'column',
    zIndex: 999999
  });
  document.body.appendChild(panel);

  // Add chat history area
  const chatHistory = document.createElement('div');
  Object.assign(chatHistory.style, {
    flex: '1',
    overflowY: 'auto',
    padding: '15px',
    background: '#F5F5F1',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px'
  });
  panel.appendChild(chatHistory);

  // Add input container
  const inputContainer = document.createElement('div');
  Object.assign(inputContainer.style, {
    padding: '15px',
    borderTop: '1px solid rgb(134,58,74)',
    background: '#F5F5F1',
    borderBottomLeftRadius: '4px',
    borderBottomRightRadius: '4px'
  });

  // Add text area & send button
  const textArea = document.createElement('textarea');
  textArea.placeholder = 'Enter your instructions... e.g. "Fill out my name as John Doe, address as 123 Main St"';
  Object.assign(textArea.style, {
    width: '100%',
    height: '80px',
    padding: '10px',
    border: '1px solid rgb(134,58,74)',
    borderRadius: '4px',
    resize: 'none',
    marginBottom: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
    background: '#F5F5F1',
    color: 'rgb(134,58,74)'
  });

  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Fill Form';
  Object.assign(sendBtn.style, {
    background: 'rgb(134,58,74)',
    color: '#F5F5F1',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
    fontWeight: 'bold',
    fontSize: '14px'
  });

  inputContainer.appendChild(textArea);
  inputContainer.appendChild(sendBtn);
  panel.appendChild(inputContainer);

  // --- 3. Show/hide panel on floating button click ---
  btn.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    if (panel.style.display === 'flex') {
      textArea.focus();
      // Detect and send fields to popup
      const fields = detectFormFields();
      chrome.runtime.sendMessage({
        type: 'FIELDS_DETECTED',
        fields
      });
    }
  });

  // Function to detect form fields
  function detectFormFields() {
    const fields = {};
    const formElements = document.querySelectorAll('input, textarea, select');
    
    formElements.forEach(elem => {
      if (elem.type !== 'submit' && elem.type !== 'button' && elem.type !== 'hidden') {
        const fieldIdentifiers = [
          elem.name,
          elem.id,
          elem.getAttribute('aria-label'),
          elem.placeholder,
          findLabel(elem)?.textContent.trim()
        ].filter(Boolean);

        // Use the first available identifier
        const fieldName = fieldIdentifiers[0];
        if (fieldName) {
          fields[fieldName] = elem.value || '';
        }
      }
    });

    return fields;
  }

  // Add message to chat
  function addMessage(text, isError = false, isAction = false) {
    console.log('=== Adding message ===', {
      text,
      isError,
      isAction
    });
    
    const msgDiv = document.createElement('div');
    Object.assign(msgDiv.style, {
      padding: '10px',
      marginBottom: '10px',
      borderRadius: '4px',
      fontSize: '14px',
      whiteSpace: 'pre-wrap',
      background: isError ? '#FFF0F0' : isAction ? '#F5F5F1' : '#FFFFFF',
      color: 'rgb(134,58,74)',
      border: `1px solid ${isError ? '#FFD0D0' : isAction ? 'rgb(134,58,74)' : '#E0E0E0'}`
    });

    // If it's a field list message, create a structured list
    if (text.startsWith('Fields filled:')) {
      console.log('Creating field list message');
      const [header, ...fields] = text.split('\n');
      msgDiv.innerHTML = `
        <div style="font-weight: 500; margin-bottom: 8px;">${header}</div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${fields.map(field => {
            console.log('Processing field:', field);
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-weight: 500; color: rgb(134,58,74);">${field}</span>
                <button class="add-to-saved" style="
                  width: 24px;
                  height: 24px;
                  border: 2px solid rgb(134,58,74);
                  border-radius: 50%;
                  position: relative;
                  cursor: pointer;
                  background: transparent;
                  padding: 0;
                  transition: all 0.3s ease;
                ">
                  <span style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 18px;
                    color: rgb(134,58,74);
                    line-height: 1;
                  ">+</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Add click handlers for the add buttons
      msgDiv.querySelectorAll('.add-to-saved').forEach((btn, index) => {
        console.log('Adding click handler for button', index);
        const field = fields[index];
        const [displayName, value] = field.split(': ');
        
        btn.addEventListener('click', () => {
          console.log('Add button clicked:', { displayName, value });
          // Animate the button
          btn.style.transform = 'scale(0.9)';
          btn.style.background = 'rgb(134,58,74)';
          btn.querySelector('span').style.color = '#F5F5F1';
          
          // Save the field
          const cleanValue = value.replace(/^"(.*)"$/, '$1');
          console.log('Saving field:', { displayName, cleanValue });
          
          saveUserInfo(displayName, cleanValue)
            .then(() => {
              // Show success state
              btn.innerHTML = '<span style="color: #F5F5F1;">✓</span>';
              setTimeout(() => {
                btn.style.transform = 'scale(1)';
                btn.style.background = 'rgb(76,175,80)';
              }, 200);
            })
            .catch(error => {
              console.error('Failed to save field:', error);
              // Show error state
              btn.innerHTML = '<span style="color: #F5F5F1;">!</span>';
              btn.style.background = '#f44336';
              setTimeout(() => {
                btn.style.transform = 'scale(1)';
              }, 200);
            });
        });
      });
    } else {
      msgDiv.textContent = text;
    }
    
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    console.log('Message added to chat');
  }

  // Save user information
  async function saveUserInfo(displayName, value) {
    console.log('=== START: saveUserInfo ===', { displayName, value });
    
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['userInfo'], (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error reading from storage:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }

        const userInfo = result.userInfo || {};
        console.log('Current userInfo:', userInfo);
        
        // Clean and normalize the display name
        const cleanDisplayName = displayName
          .replace(/([A-Z])/g, ' $1')
          .replace(/[_-]/g, ' ')
          .trim()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        console.log('Cleaned display name:', cleanDisplayName);

        // Update the value
        userInfo[cleanDisplayName] = value;

        console.log('Saving updated userInfo:', userInfo);
        chrome.storage.local.set({ userInfo }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error saving to storage:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log('Successfully saved to storage');
            resolve();
          }
        });
      });
    });
    
    console.log('=== END: saveUserInfo ===\n');
  }

  // Fill form fields
  function fillFormFields(fields) {
    console.log('=== START: fillFormFields ===');
    console.log('Received fields to fill:', fields);
    
    let filledCount = 0;
    let filledDetails = [];
    let filledDisplayNames = new Set(); // Track semantic field names
    let filledSelectors = new Set(); // Track technical selectors
    
    // Sort fields by confidence to prioritize high-confidence matches
    const sortedFields = [...fields].sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    
    sortedFields.forEach((field) => {
      console.log('\nProcessing field:', field);
      try {
        // Skip if we've already filled this semantic field
        if (filledDisplayNames.has(field.display_name)) {
          console.log('Skipping duplicate semantic field:', field.display_name);
          return;
        }
        
        // Skip if we've already used this selector
        if (filledSelectors.has(field.selector)) {
          console.log('Skipping duplicate selector:', field.selector);
          return;
        }
        
        const elements = document.querySelectorAll(field.selector);
        console.log(`Found ${elements.length} elements matching selector:`, field.selector);
        
        elements.forEach(elem => {
          console.log('Element details:', {
            tagName: elem.tagName,
            type: elem.type,
            name: elem.name,
            id: elem.id,
            'aria-label': elem.getAttribute('aria-label'),
            placeholder: elem.placeholder
          });

          if (elem && (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA' || elem.tagName === 'SELECT')) {
            const oldValue = elem.value;
            elem.value = field.value;
            elem.dispatchEvent(new Event('input', { bubbles: true }));
            elem.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Only count if value was actually changed
            if (elem.value === field.value) {
              filledCount++;
              
              console.log('Field filled:', {
                selector: field.selector,
                displayName: field.display_name,
                oldValue,
                newValue: field.value,
                success: true
              });
              
              // Add to filled details only once per semantic field
              if (!filledDisplayNames.has(field.display_name)) {
                filledDetails.push({
                  displayName: field.display_name,
                  value: field.value,
                  confidence: field.confidence
                });
                filledDisplayNames.add(field.display_name);
              }
              filledSelectors.add(field.selector);
            } else {
              console.log('Failed to set field value:', {
                selector: field.selector,
                displayName: field.display_name,
                oldValue,
                attemptedValue: field.value,
                actualValue: elem.value
              });
            }
          } else {
            console.log('Skipping element - not a fillable input');
          }
        });
      } catch (err) {
        console.error('Failed to fill field:', field, err);
      }
    });

    console.log('\nFill Summary:', {
      totalFieldsReceived: fields.length,
      fieldsActuallyFilled: filledCount,
      uniqueSelectors: Array.from(filledSelectors),
      uniqueDisplayNames: Array.from(filledDisplayNames),
      details: filledDetails
    });
    console.log('=== END: fillFormFields ===\n');
    
    return { 
      count: filledCount, 
      details: filledDetails.map(detail => `${detail.displayName}: "${detail.value}"`)
    };
  }

  // Handle send action
  function handleSend() {
    console.log('=== START: handleSend ===');
    const userPrompt = textArea.value.trim();
    if (!userPrompt) {
      console.log('Empty prompt, aborting');
      addMessage('Please enter some instructions.', true);
      return;
    }
    
    console.log('User prompt:', userPrompt);
    addMessage(`You: ${userPrompt}`);
    textArea.value = ''; // Clear input
    
    // Get relevant form elements for context
    const formElements = document.querySelectorAll('input, textarea, select');
    console.log(`Found ${formElements.length} form elements on page`);
    
    const relevantHtml = Array.from(formElements)
      .map(el => el.outerHTML)
      .join('\n');
    
    console.log('Sending message to background script with form elements:', 
      Array.from(formElements).map(el => ({
        tagName: el.tagName,
        type: el.type,
        name: el.name,
        id: el.id,
        'aria-label': el.getAttribute('aria-label')
      }))
    );

    // Send message to background script
    chrome.runtime.sendMessage({
      type: 'CALL_LLM',
      userPrompt,
      pageDom: relevantHtml
    }, (response) => {
      console.log('Received response from background script:', response);
      
      if (!response?.success) {
        console.error('Error from background script:', response?.error);
        addMessage('Error: ' + (response?.error || 'Unknown error'), true);
        return;
      }

      try {
        console.log('Parsing LLM response:', response.llmResponse);
        const parsed = JSON.parse(response.llmResponse);
        console.log('Parsed LLM response:', parsed);
        
        if (parsed.fields && Array.isArray(parsed.fields)) {
          const { count, details } = fillFormFields(parsed.fields);
          addMessage(`Assistant: Filled ${count} field(s) based on your instructions.`);
          if (details.length > 0) {
            addMessage('Fields filled:\n' + details.join('\n'), false, true);
          }
        } else {
          console.error('Invalid response format:', parsed);
          addMessage('Error: Invalid response format from AI', true);
        }
      } catch (err) {
        console.error('Failed to parse JSON from LLM:', err);
        addMessage('Error: Failed to process AI response', true);
      }
    });
    console.log('=== END: handleSend ===\n');
  }

  // Handle send button click
  sendBtn.addEventListener('click', handleSend);

  // Handle Enter key (Shift+Enter for new line)
  textArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Listen for form submissions
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    // Collect form data
    const formData = new FormData(form);
    const formFields = {};
    
    for (const [name, value] of formData.entries()) {
      const field = form.querySelector(`[name="${name}"]`);
      if (field) {
        formFields[name] = {
          value: value,
          selector: generateSelector(field),
          label: findLabel(field),
          type: field.type || 'text'
        };
      }
    }

    // Save the form data
    chrome.runtime.sendMessage({
      type: 'SAVE_FORM_DATA',
      formData: {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        fields: formFields
      }
    });
  });

  // Helper function to generate a unique selector for an element
  function generateSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.name) {
      return `[name="${element.name}"]`;
    }
    
    // Fallback to a more complex selector
    const path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.className) {
        selector += `.${element.className.split(' ').join('.')}`;
      }
      path.unshift(selector);
      element = element.parentNode;
    }
    return path.join(' > ');
  }

  // Helper function to find the label for a form field
  function findLabel(element) {
    // Check for aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Check for associated label element
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent.trim();
    }

    // Check for parent label
    const parentLabel = element.closest('label');
    if (parentLabel) return parentLabel.textContent.trim();

    // Check for placeholder
    const placeholder = element.getAttribute('placeholder');
    if (placeholder) return placeholder;

    return '';
  }

})(); 