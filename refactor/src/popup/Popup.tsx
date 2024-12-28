import React, { useState, useEffect } from 'react';
import './Popup.css';

interface SavedInfo {
  [key: string]: string;
}

const Popup: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'verified' | 'missing'>('missing');
  const [apiMessage, setApiMessage] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [savedInfo, setSavedInfo] = useState<SavedInfo>({});
  const [showFloatingButton, setShowFloatingButton] = useState<boolean>(true);

  useEffect(() => {
    // Load API key and check status
    chrome.storage.local.get(['openaiApiKey'], async (result) => {
      if (result.openaiApiKey) {
        const isValid = await checkApiKey(result.openaiApiKey);
        setApiStatus(isValid ? 'verified' : 'missing');
        setApiMessage(isValid ? '✓ API Key verified and ready' : 'Please enter your OpenAI API key to start');
      }
    });

    // Load saved information
    loadSavedInfo();

    // Load floating button state
    chrome.storage.local.get(['showFloatingButton'], (result) => {
      setShowFloatingButton(result.showFloatingButton ?? true);
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.userInfo) {
        loadSavedInfo();
      }
    });
  }, []);

  const checkApiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setApiMessage('Please enter an API key');
      return;
    }

    setIsVerifying(true);
    setApiMessage('Verifying...');

    const isValid = await checkApiKey(apiKey);

    if (isValid) {
      await chrome.storage.local.set({ openaiApiKey: apiKey });
      setApiStatus('verified');
      setApiMessage('✓ API Key verified and ready');
    } else {
      setApiStatus('missing');
      setApiMessage('Invalid API key. Please check and try again.');
    }

    setIsVerifying(false);
  };

  const loadSavedInfo = () => {
    chrome.storage.local.get(['userInfo'], (result) => {
      setSavedInfo(result.userInfo || {});
    });
  };

  const handleSaveChanges = async () => {
    await chrome.storage.local.set({ userInfo: savedInfo });
  };

  const handleCopyAll = async () => {
    const textToCopy = Object.entries(savedInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    await navigator.clipboard.writeText(textToCopy);
  };

  const handleCopyValue = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  const handleToggleFloatingButton = (checked: boolean) => {
    setShowFloatingButton(checked);
    chrome.storage.local.set({ showFloatingButton: checked });
    
    // Notify all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOGGLE_FLOATING_BUTTON',
            show: checked
          }).catch(() => {
            // Ignore errors for tabs where content script is not injected
          });
        }
      });
    });
  };

  return (
    <div className="popup-container">
      <h1>Practical Forms</h1>
      
      <div className="api-container">
        <div className={`api-status ${apiStatus}`}>
          <div className="api-message">{apiMessage}</div>
        </div>
        {apiStatus !== 'verified' && (
          <div className="api-input-group">
            <input
              type="password"
              className="api-input"
              placeholder="Enter OpenAI API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              onClick={handleSaveApiKey}
              disabled={isVerifying}
              className={isVerifying ? 'api-button success' : 'api-button'}
            >
              {isVerifying ? '✓' : 'Save'}
            </button>
          </div>
        )}
      </div>

      <div className="saved-info">
        <h2>📋 Your Saved Information</h2>
        <div id="savedInfoList">
          {Object.keys(savedInfo).length === 0 ? (
            <div className="no-info">No information saved yet. Fill some forms to build your profile.</div>
          ) : (
            Object.entries(savedInfo).map(([key, value]) => (
              <div key={key} className="info-item">
                <span className="info-label">{key}:</span>
                <div className="info-value-container">
                  <span
                    className="info-value"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      setSavedInfo(prev => ({
                        ...prev,
                        [key]: e.currentTarget.textContent || ''
                      }));
                    }}
                  >
                    {value}
                  </span>
                  <button
                    className="copy-value"
                    onClick={() => handleCopyValue(value)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="buttons-container">
          <button className="action-button" onClick={handleSaveChanges}>
            💾 Save Changes
          </button>
          <button className="action-button" onClick={handleCopyAll}>
            📋 Copy All
          </button>
        </div>
      </div>

      <div className="toggle-container">
        <span className="toggle-label">Show floating button</span>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={showFloatingButton}
            onChange={(e) => handleToggleFloatingButton(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="info">
        Look for the button on web pages to start filling forms using AI.
      </div>

      <div className="status">
        {apiStatus === 'verified'
          ? 'Ready to fill forms! Click the floating button on any webpage to start.'
          : 'Configure your OpenAI API key to start using the form filler.'}
      </div>
    </div>
  );
};

export default Popup; 