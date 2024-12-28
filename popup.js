document.addEventListener('DOMContentLoaded', () => {
  const apiStatus = document.getElementById('apiStatus');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveApiKeyButton = document.getElementById('saveApiKey');
  const apiMessage = apiStatus.querySelector('.api-message');
  const tipText = document.getElementById('tipText');
  const savedInfoList = document.getElementById('savedInfoList');
  const floatingButtonToggle = document.getElementById('floatingButtonToggle');
  const saveButton = document.getElementById('saveButton');
  const copyButton = document.getElementById('copyButton');
  
  let currentUserInfo = {};

  // Add storage change listener
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.userInfo) {
      loadSavedInfo(); // Reload saved info when storage changes
    }
  });

  // Check API key status on load
  async function checkApiKey(apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'just say "hi."' }],
          max_tokens: 5
        })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  function showApiStatus(status, message = '') {
    if (status === 'verified') {
      apiStatus.className = 'api-status verified';
      apiMessage.textContent = '✓ API Key verified and ready';
      tipText.textContent = 'Ready to fill forms! Click the floating button on any webpage to start.';
    } else {
      apiStatus.className = 'api-status';
      apiMessage.textContent = message || 'Please enter your OpenAI API key to start';
      tipText.textContent = 'Configure your OpenAI API key to start using the form filler.';
    }
  }

  // Load and check API key
  chrome.storage.local.get(['openaiApiKey'], async (result) => {
    if (result.openaiApiKey) {
      const isValid = await checkApiKey(result.openaiApiKey);
      showApiStatus(isValid ? 'verified' : 'missing');
    } else {
      showApiStatus('missing');
    }
  });

  // Handle API key save
  saveApiKeyButton.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showApiStatus('missing', 'Please enter an API key');
      return;
    }

    saveApiKeyButton.disabled = true;
    apiMessage.textContent = 'Verifying...';
    
    const isValid = await checkApiKey(apiKey);
    
    if (isValid) {
      saveApiKeyButton.classList.add('success');
      await chrome.storage.local.set({ openaiApiKey: apiKey });
      setTimeout(() => {
        showApiStatus('verified');
      }, 1000);
    } else {
      saveApiKeyButton.disabled = false;
      saveApiKeyButton.classList.remove('success');
      showApiStatus('missing', 'Invalid API key. Please check and try again.');
    }
  });

  // Handle input changes
  apiKeyInput.addEventListener('input', () => {
    saveApiKeyButton.disabled = false;
    saveApiKeyButton.classList.remove('success');
    apiMessage.textContent = '';
  });

  // Load toggle state
  chrome.storage.local.get(['showFloatingButton'], (result) => {
    const showFloatingButton = result.showFloatingButton ?? true; // Default to true
    floatingButtonToggle.checked = showFloatingButton;
  });

  // Save toggle state and notify content script
  floatingButtonToggle.addEventListener('change', () => {
    const showFloatingButton = floatingButtonToggle.checked;
    chrome.storage.local.set({ showFloatingButton });
    
    // Notify all tabs to update the floating button visibility
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'TOGGLE_FLOATING_BUTTON',
          show: showFloatingButton
        }).catch(() => {
          // Ignore errors for tabs where content script is not injected
        });
      });
    });
  });

  // Load saved information
  function loadSavedInfo() {
    chrome.storage.local.get(['userInfo'], (result) => {
      currentUserInfo = result.userInfo || {};
      const infoKeys = Object.keys(currentUserInfo);
      
      if (infoKeys.length === 0) {
        savedInfoList.innerHTML = '<div class="no-info">No information saved yet. Fill some forms to build your profile.</div>';
        return;
      }

      savedInfoList.innerHTML = '';
      infoKeys.forEach(key => {
        const infoItem = document.createElement('div');
        infoItem.className = 'info-item';
        infoItem.innerHTML = `
          <span class="info-label">${key}:</span>
          <div class="info-value-container">
            <span class="info-value" contenteditable="true" data-key="${key}">"${currentUserInfo[key]}"</span>
            <button class="copy-value" title="Copy value">+</button>
          </div>
        `;
        savedInfoList.appendChild(infoItem);
      });

      // Add event listeners to editable fields
      document.querySelectorAll('.info-value').forEach(field => {
        field.addEventListener('input', () => {
          currentUserInfo[field.dataset.key] = field.textContent.trim();
        });
      });

      // Add event listeners to copy buttons
      document.querySelectorAll('.copy-value').forEach(button => {
        button.addEventListener('click', async (e) => {
          const value = e.target.previousElementSibling.textContent;
          await navigator.clipboard.writeText(value);
          
          // Visual feedback
          const originalText = button.textContent;
          button.textContent = '✓';
          button.style.background = '#4CAF50';
          setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
          }, 1000);
        });
      });
    });
  }

  // Save button click handler
  saveButton.addEventListener('click', async () => {
    saveButton.classList.add('clicked');
    await chrome.storage.local.set({ userInfo: currentUserInfo });
    
    setTimeout(() => {
      saveButton.classList.remove('clicked');
    }, 500);
  });

  // Copy button click handler
  copyButton.addEventListener('click', async () => {
    copyButton.classList.add('clicked');
    
    const textToCopy = Object.entries(currentUserInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    await navigator.clipboard.writeText(textToCopy);
    
    setTimeout(() => {
      copyButton.classList.remove('clicked');
    }, 500);
  });

  openOptionsButton.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
    window.close();
  });

  // Load saved information when popup opens
  loadSavedInfo();
}); 