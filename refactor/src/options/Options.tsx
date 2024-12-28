import React, { useState, useEffect } from 'react';
import './Options.css';

interface Settings {
  apiKey: string;
  model: string;
}

const Options: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    model: 'gpt-4o'
  });

  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    // Load saved settings
    chrome.storage.sync.get(['apiKey', 'model'], (result) => {
      setSettings({
        apiKey: result.apiKey || '',
        model: result.model || 'gpt-4o'
      });
    });
  }, []);

  const handleSave = async () => {
    try {
      await chrome.storage.sync.set(settings);
      setStatus('Settings saved successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('Error saving settings');
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="options-container">
      <h1>Practical Forms Settings</h1>
      
      <div className="form-group">
        <label htmlFor="apiKey">API Key:</label>
        <input
          type="password"
          id="apiKey"
          value={settings.apiKey}
          onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
          placeholder="Enter your API key"
        />
      </div>

      <div className="form-group">
        <label htmlFor="model">Model:</label>
        <select
          id="model"
          value={settings.model}
          onChange={(e) => setSettings({ ...settings, model: e.target.value })}
        >
          <option value="gpt-4o">gpt-4o</option>
          <option value="gpt-4o-mini">gpt-4o-mini</option>
        </select>
      </div>

      <button onClick={handleSave}>Save Settings</button>
      
      {status && <div className="status-message">{status}</div>}
    </div>
  );
};

export default Options; 