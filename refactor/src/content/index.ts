interface FormFillMessage {
  type: 'FILL_FORM';
  prompt: string;
}

interface ToggleFloatingButtonMessage {
  type: 'TOGGLE_FLOATING_BUTTON';
  show: boolean;
}

interface ProcessPromptMessage {
  type: 'PROCESS_PROMPT';
  prompt: string;
  pageDom: string;
}

interface ProcessPromptResponse {
  success: boolean;
  fields?: FormField[];
  error?: string;
  details?: string;
}

interface FormField {
  selector: string;
  value: string;
  display_name: string;
}

type ContentMessage = FormFillMessage | ToggleFloatingButtonMessage;

// Create and manage floating button
class Sidebar {
  private container: HTMLDivElement;
  private isVisible: boolean = false;
  private activeTab: 'settings' | 'agent' = 'settings';
  private chatArea: HTMLDivElement;
  private messages: { role: 'user' | 'assistant'; content: string }[] = [];

  constructor() {
    // Create sidebar container
    this.container = document.createElement('div');
    this.container.className = 'practical-form-sidebar';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      right: -450px;
      width: 450px;
      height: 100vh;
      background: #FFFFFF;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      transition: right 0.3s ease;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    `;

    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 15px;
      background: rgb(134,58,74);
      color: #F5F5F1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    const title = document.createElement('h1');
    title.textContent = 'Practical Forms';
    title.style.cssText = `
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: #F5F5F1;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    header.appendChild(title);
    header.appendChild(closeButton);

    // Create tabs
    const tabs = document.createElement('div');
    tabs.style.cssText = `
      display: flex;
      border-bottom: 1px solid rgba(134,58,74,0.2);
    `;

    const createTab = (text: string, tabId: 'settings' | 'agent') => {
      const tab = document.createElement('button');
      tab.textContent = text;
      tab.style.cssText = `
        flex: 1;
        padding: 12px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: rgb(134,58,74);
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s ease;
      `;
      tab.addEventListener('click', () => this.switchTab(tabId));
      return tab;
    };

    const settingsTab = createTab('Settings', 'settings');
    const agentTab = createTab('Agent', 'agent');
    tabs.appendChild(settingsTab);
    tabs.appendChild(agentTab);

    // Create content container
    const content = document.createElement('div');
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    `;

    // Create settings content (iframe)
    const settingsFrame = document.createElement('iframe');
    settingsFrame.id = 'settings-frame';
    settingsFrame.src = chrome.runtime.getURL('popup.html');
    settingsFrame.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      display: block;
      flex: 1;
    `;

    // Create agent content
    const agentContent = document.createElement('div');
    agentContent.id = 'agent-content';
    agentContent.style.cssText = `
      display: none;
      height: 100%;
      display: flex;
      flex-direction: column;
      flex: 1;
    `;

    // Create chat area
    this.chatArea = document.createElement('div');
    this.chatArea.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #F5F5F1;
    `;

    const inputArea = document.createElement('div');
    inputArea.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 15px;
      background: #FFFFFF;
      border-top: 1px solid rgba(134,58,74,0.2);
    `;

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Enter your instructions... e.g. "Fill out my name as John Doe"';
    textarea.style.cssText = `
      flex: 1;
      padding: 8px;
      border: 1px solid rgba(134,58,74,0.3);
      border-radius: 4px;
      resize: vertical;
      min-height: 60px;
      max-height: 150px;
      font-family: inherit;
      font-size: 14px;
    `;

    const sendButton = document.createElement('button');
    sendButton.textContent = 'Fill Form';
    sendButton.style.cssText = `
      padding: 8px 16px;
      background: rgb(134,58,74);
      color: #F5F5F1;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      height: fit-content;
      white-space: nowrap;
    `;

    inputArea.appendChild(textarea);
    inputArea.appendChild(sendButton);
    agentContent.appendChild(this.chatArea);
    agentContent.appendChild(inputArea);

    content.appendChild(settingsFrame);
    content.appendChild(agentContent);

    // Add elements to container
    this.container.appendChild(header);
    this.container.appendChild(tabs);
    this.container.appendChild(content);

    // Add to page
    document.body.appendChild(this.container);

    // Add event listeners
    closeButton.addEventListener('click', () => this.toggle(false));
    sendButton.addEventListener('click', () => this.handleSend(textarea.value));
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend(textarea.value);
      }
    });

    // Initialize first tab
    this.switchTab('settings');

    // Add welcome message
    this.addMessage('assistant', 'Hello! I\'m here to help you fill out forms. Just tell me what information you want to fill in, and I\'ll help you do it automatically.');
  }

  private addMessage(role: 'user' | 'assistant', content: string) {
    this.messages.push({ role, content });
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      padding: 10px 15px;
      border-radius: 8px;
      max-width: 80%;
      font-size: 14px;
      line-height: 1.4;
      ${role === 'assistant' ? `
        background: #FFFFFF;
        color: rgb(134,58,74);
        align-self: flex-start;
        border: 1px solid rgba(134,58,74,0.2);
      ` : `
        background: rgb(134,58,74);
        color: #FFFFFF;
        align-self: flex-end;
      `}
    `;
    messageDiv.textContent = content;
    this.chatArea.appendChild(messageDiv);
    this.chatArea.scrollTop = this.chatArea.scrollHeight;
  }

  private async handleSend(text: string) {
    const textarea = this.container.querySelector('textarea');
    const sendButton = this.container.querySelector('button:last-child') as HTMLButtonElement;
    if (!textarea || !sendButton || !text.trim()) return;

    // Add user message
    this.addMessage('user', text.trim());

    sendButton.disabled = true;
    sendButton.textContent = 'Processing...';
    textarea.value = '';

    try {
      await handleFormFill(text.trim());
      this.addMessage('assistant', 'I\'ve filled out the form based on your instructions. Let me know if you need any adjustments!');
    } catch (error) {
      console.error('Error filling form:', error);
      this.addMessage('assistant', `Error: ${(error as Error).message}`);
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = 'Fill Form';
    }
  }

  private switchTab(tab: 'settings' | 'agent') {
    this.activeTab = tab;
    const settingsFrame = document.getElementById('settings-frame') as HTMLIFrameElement;
    const agentContent = document.getElementById('agent-content') as HTMLDivElement;

    if (tab === 'settings') {
      settingsFrame.style.display = 'block';
      agentContent.style.display = 'none';
    } else {
      settingsFrame.style.display = 'none';
      agentContent.style.display = 'flex';
    }

    // Update tab styles
    const tabs = this.container.querySelectorAll('button');
    tabs.forEach((t, i) => {
      if ((i === 0 && tab === 'settings') || (i === 1 && tab === 'agent')) {
        t.style.borderBottom = '2px solid rgb(134,58,74)';
        t.style.color = 'rgb(134,58,74)';
      } else {
        t.style.borderBottom = '2px solid transparent';
        t.style.color = 'rgba(134,58,74,0.7)';
      }
    });
  }

  public toggle(show?: boolean) {
    this.isVisible = show ?? !this.isVisible;
    this.container.style.right = this.isVisible ? '0' : '-450px';
  }

  public setVisibility(visible: boolean) {
    if (visible !== this.isVisible) {
      this.toggle(visible);
    }
  }
}

// Initialize sidebar instead of floating button
const sidebar = new Sidebar();

// Update message handlers to use sidebar
chrome.runtime.onMessage.addListener((
  message: ContentMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  if (message.type === 'FILL_FORM') {
    handleFormFill(message.prompt)
      .then(() => sendResponse({ success: true }))
      .catch(error => {
        console.error('Error:', error);
        sendResponse({ error: error.message });
      });
    return true; // Will respond asynchronously
  } else if (message.type === 'TOGGLE_FLOATING_BUTTON') {
    sidebar.setVisibility(message.show);
    sendResponse({ success: true });
    return false;
  }
  return false;
});

async function handleFormFill(prompt: string): Promise<void> {
  try {
    // Get the page DOM
    const pageDom = document.documentElement.outerHTML;

    // Send the prompt to the background script for processing
    const response = await chrome.runtime.sendMessage<ProcessPromptMessage, ProcessPromptResponse>({
      type: 'PROCESS_PROMPT',
      prompt,
      pageDom
    });

    if (!response.success) {
      throw new Error(response.error || 'Unknown error');
    }

    if (response.fields) {
      fillFormFields(response.fields);
    }
  } catch (error) {
    console.error('Error processing form fill:', error);
    throw error;
  }
}

function fillFormFields(fields: FormField[]): void {
  fields.forEach(field => {
    const element = document.querySelector(field.selector) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (element) {
      element.value = field.value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
} 