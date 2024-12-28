document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveKeyBtn = document.getElementById('saveKey');
  const statusDiv = document.getElementById('status');

  function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    statusDiv.className = isError ? 'error' : 'success';
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }

  // Load any previously saved key
  chrome.storage.local.get(['openaiApiKey'], (result) => {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
      showStatus('API key loaded from storage', false);
    }
  });

  // Save the API key on button click
  saveKeyBtn.addEventListener('click', () => {
    const enteredKey = apiKeyInput.value.trim();
    if (!enteredKey) {
      showStatus('Please enter a valid API key', true);
      return;
    }

    if (!enteredKey.startsWith('sk-')) {
      showStatus('API key should start with "sk-"', true);
      return;
    }

    chrome.storage.local.set({ openaiApiKey: enteredKey }, () => {
      if (chrome.runtime.lastError) {
        showStatus('Error saving API key: ' + chrome.runtime.lastError.message, true);
      } else {
        showStatus('API key saved successfully!');
        
        // Test the API key
        fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${enteredKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 5
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API test failed: ${response.status}`);
          }
          showStatus('API key verified successfully!');
        })
        .catch(error => {
          showStatus('API key verification failed: ' + error.message, true);
        });
      }
    });
  });
}); 