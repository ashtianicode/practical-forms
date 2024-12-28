(()=>{"use strict";var n,e={262:(n,e,o)=>{o.d(e,{A:()=>s});var t=o(601),i=o.n(t),r=o(314),a=o.n(r)()(i());a.push([n.id,"body {\n  width: 100%;\n  height: 100%;\n  margin: 0;\n  padding: 15px;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;\n  background: #F5F5F1;\n  color: rgb(134,58,74);\n  box-sizing: border-box;\n}\n\nh1 {\n  font-size: 18px;\n  margin: 0 0 15px 0;\n  color: rgb(134,58,74);\n}\n\n.popup-container {\n  width: 100%;\n  height: 100%;\n  overflow-y: auto;\n}\n\n.info {\n  font-size: 14px;\n  color: rgb(134,58,74);\n  margin-bottom: 15px;\n  line-height: 1.4;\n}\n\nbutton {\n  background: rgb(134,58,74);\n  color: #F5F5F1;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 14px;\n  width: 100%;\n  font-weight: bold;\n}\n\nbutton:hover {\n  opacity: 0.9;\n}\n\n.api-container {\n  margin-bottom: 15px;\n}\n\n.api-status {\n  display: block;\n  background: #FFFFFF;\n  border: 1px solid rgb(134,58,74);\n  border-radius: 4px;\n  padding: 12px;\n  margin-bottom: 15px;\n}\n\n.api-status.verified {\n  background: rgb(134,58,74);\n  color: #F5F5F1;\n}\n\n.api-input-group {\n  display: flex;\n  gap: 8px;\n}\n\n.api-input {\n  flex: 1;\n  padding: 8px 12px;\n  border: 1px solid rgba(134,58,74,0.3);\n  border-radius: 4px;\n  font-size: 14px;\n  color: rgb(134,58,74);\n  background: #F5F5F1;\n  transition: all 0.2s ease;\n}\n\n.api-input:focus {\n  outline: none;\n  border-color: rgb(134,58,74);\n  background: #FFFFFF;\n}\n\n.api-message {\n  margin-top: 8px;\n  font-size: 13px;\n  color: rgb(134,58,74);\n  text-align: center;\n  min-height: 20px;\n}\n\n.verified .api-input-group {\n  display: none;\n}\n\n.verified .api-message {\n  color: #F5F5F1;\n  font-weight: 500;\n  margin-top: 0;\n}\n\n.saved-info {\n  margin: 15px 0;\n  padding: 10px;\n  background: #FFFFFF;\n  border: 1px solid rgb(134,58,74);\n  border-radius: 4px;\n}\n\n.saved-info h2 {\n  font-size: 14px;\n  margin: 0 0 10px 0;\n  color: rgb(134,58,74);\n}\n\n.info-item {\n  display: flex;\n  align-items: center;\n  padding: 12px;\n  background: #FFFFFF;\n  border: 1px solid rgba(134,58,74,0.2);\n  margin-bottom: 8px;\n  border-radius: 4px;\n  font-size: 13px;\n  box-shadow: 0 2px 4px rgba(134,58,74,0.1);\n  transition: all 0.2s ease;\n}\n\n.info-item:hover {\n  box-shadow: 0 4px 8px rgba(134,58,74,0.15);\n  transform: translateY(-1px);\n}\n\n.info-label {\n  color: rgb(134,58,74);\n  font-weight: 500;\n  margin-right: 8px;\n}\n\n.info-value {\n  color: rgb(134,58,74);\n  font-weight: 500;\n  padding: 2px 6px;\n  border: 1px solid transparent;\n  border-radius: 3px;\n}\n\n.info-value-container {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.copy-value {\n  background: rgb(134,58,74);\n  color: #F5F5F1;\n  border: none;\n  width: 24px;\n  height: 24px;\n  border-radius: 4px;\n  cursor: pointer;\n  font-size: 16px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0;\n  transition: all 0.2s ease;\n}\n\n.copy-value:hover {\n  opacity: 0.9;\n}\n\n.buttons-container {\n  display: flex;\n  gap: 8px;\n  margin-top: 15px;\n}\n\n.action-button {\n  flex: 1;\n}\n\n.toggle-container {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin: 15px 0;\n  padding: 10px;\n  background: #FFFFFF;\n  border: 1px solid rgb(134,58,74);\n  border-radius: 4px;\n}\n\n.toggle-label {\n  font-size: 14px;\n  color: rgb(134,58,74);\n}\n\n.toggle-switch {\n  position: relative;\n  display: inline-block;\n  width: 40px;\n  height: 20px;\n}\n\n.toggle-switch input {\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n\n.toggle-slider {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: #ccc;\n  transition: .4s;\n  border-radius: 20px;\n}\n\n.toggle-slider:before {\n  position: absolute;\n  content: \"\";\n  height: 16px;\n  width: 16px;\n  left: 2px;\n  bottom: 2px;\n  background-color: white;\n  transition: .4s;\n  border-radius: 50%;\n}\n\ninput:checked + .toggle-slider {\n  background-color: rgb(134,58,74);\n}\n\ninput:checked + .toggle-slider:before {\n  transform: translateX(20px);\n}\n\n.no-info {\n  text-align: center;\n  color: rgb(134,58,74);\n  opacity: 0.7;\n  padding: 20px;\n  font-style: italic;\n}\n\n.status {\n  font-size: 13px;\n  color: rgb(134,58,74);\n  margin-top: 10px;\n  padding-top: 10px;\n  border-top: 1px solid rgb(134,58,74);\n}\n\n.hidden {\n  display: none !important;\n} ",""]);const s=a},841:(n,e,o)=>{var t=o(848),i=o(338),r=o(540),a=o(72),s=o.n(a),l=o(825),d=o.n(l),c=o(659),p=o.n(c),g=o(56),u=o.n(g),b=o(159),f=o.n(b),h=o(113),x=o.n(h),m=o(262),v={};v.styleTagTransform=x(),v.setAttributes=u(),v.insert=p().bind(null,"head"),v.domAPI=d(),v.insertStyleElement=f(),s()(m.A,v),m.A&&m.A.locals&&m.A.locals;var y=function(n,e,o,t){return new(o||(o=Promise))((function(i,r){function a(n){try{l(t.next(n))}catch(n){r(n)}}function s(n){try{l(t.throw(n))}catch(n){r(n)}}function l(n){var e;n.done?i(n.value):(e=n.value,e instanceof o?e:new o((function(n){n(e)}))).then(a,s)}l((t=t.apply(n,e||[])).next())}))};const F=document.getElementById("root");if(!F)throw new Error("Failed to find root element");(0,i.H)(F).render((0,t.jsx)((()=>{const[n,e]=(0,r.useState)(""),[o,i]=(0,r.useState)("missing"),[a,s]=(0,r.useState)(""),[l,d]=(0,r.useState)(!1),[c,p]=(0,r.useState)({}),[g,u]=(0,r.useState)(!0);(0,r.useEffect)((()=>{chrome.storage.local.get(["openaiApiKey"],(n=>y(void 0,void 0,void 0,(function*(){if(n.openaiApiKey){const e=yield b(n.openaiApiKey);i(e?"verified":"missing"),s(e?"✓ API Key verified and ready":"Please enter your OpenAI API key to start")}})))),f(),chrome.storage.local.get(["showFloatingButton"],(n=>{var e;u(null===(e=n.showFloatingButton)||void 0===e||e)})),chrome.storage.onChanged.addListener(((n,e)=>{"local"===e&&n.userInfo&&f()}))}),[]);const b=n=>y(void 0,void 0,void 0,(function*(){try{return(yield fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:"gpt-4",messages:[{role:"user",content:"test"}],max_tokens:5})})).ok}catch(n){return!1}})),f=()=>{chrome.storage.local.get(["userInfo"],(n=>{p(n.userInfo||{})}))};return(0,t.jsxs)("div",{className:"popup-container",children:[(0,t.jsx)("h1",{children:"Practical Forms"}),(0,t.jsxs)("div",{className:"api-container",children:[(0,t.jsx)("div",{className:`api-status ${o}`,children:(0,t.jsx)("div",{className:"api-message",children:a})}),"verified"!==o&&(0,t.jsxs)("div",{className:"api-input-group",children:[(0,t.jsx)("input",{type:"password",className:"api-input",placeholder:"Enter OpenAI API Key",value:n,onChange:n=>e(n.target.value)}),(0,t.jsx)("button",{onClick:()=>y(void 0,void 0,void 0,(function*(){n.trim()?(d(!0),s("Verifying..."),(yield b(n))?(yield chrome.storage.local.set({openaiApiKey:n}),i("verified"),s("✓ API Key verified and ready")):(i("missing"),s("Invalid API key. Please check and try again.")),d(!1)):s("Please enter an API key")})),disabled:l,className:l?"api-button success":"api-button",children:l?"✓":"Save"})]})]}),(0,t.jsxs)("div",{className:"saved-info",children:[(0,t.jsx)("h2",{children:"📋 Your Saved Information"}),(0,t.jsx)("div",{id:"savedInfoList",children:0===Object.keys(c).length?(0,t.jsx)("div",{className:"no-info",children:"No information saved yet. Fill some forms to build your profile."}):Object.entries(c).map((([n,e])=>(0,t.jsxs)("div",{className:"info-item",children:[(0,t.jsxs)("span",{className:"info-label",children:[n,":"]}),(0,t.jsxs)("div",{className:"info-value-container",children:[(0,t.jsx)("span",{className:"info-value",contentEditable:!0,suppressContentEditableWarning:!0,onBlur:e=>{p((o=>Object.assign(Object.assign({},o),{[n]:e.currentTarget.textContent||""})))},children:e}),(0,t.jsx)("button",{className:"copy-value",onClick:()=>(n=>y(void 0,void 0,void 0,(function*(){yield navigator.clipboard.writeText(n)})))(e),children:"+"})]})]},n)))}),(0,t.jsxs)("div",{className:"buttons-container",children:[(0,t.jsx)("button",{className:"action-button",onClick:()=>y(void 0,void 0,void 0,(function*(){yield chrome.storage.local.set({userInfo:c})})),children:"💾 Save Changes"}),(0,t.jsx)("button",{className:"action-button",onClick:()=>y(void 0,void 0,void 0,(function*(){const n=Object.entries(c).map((([n,e])=>`${n}: ${e}`)).join("\n");yield navigator.clipboard.writeText(n)})),children:"📋 Copy All"})]})]}),(0,t.jsxs)("div",{className:"toggle-container",children:[(0,t.jsx)("span",{className:"toggle-label",children:"Show floating button"}),(0,t.jsxs)("label",{className:"toggle-switch",children:[(0,t.jsx)("input",{type:"checkbox",checked:g,onChange:n=>{return e=n.target.checked,u(e),chrome.storage.local.set({showFloatingButton:e}),void chrome.tabs.query({},(n=>{n.forEach((n=>{n.id&&chrome.tabs.sendMessage(n.id,{type:"TOGGLE_FLOATING_BUTTON",show:e}).catch((()=>{}))}))}));var e}}),(0,t.jsx)("span",{className:"toggle-slider"})]})]}),(0,t.jsx)("div",{className:"info",children:"Look for the button on web pages to start filling forms using AI."}),(0,t.jsx)("div",{className:"status",children:"verified"===o?"Ready to fill forms! Click the floating button on any webpage to start.":"Configure your OpenAI API key to start using the form filler."})]})}),{}))}},o={};function t(n){var i=o[n];if(void 0!==i)return i.exports;var r=o[n]={id:n,exports:{}};return e[n](r,r.exports,t),r.exports}t.m=e,n=[],t.O=(e,o,i,r)=>{if(!o){var a=1/0;for(c=0;c<n.length;c++){for(var[o,i,r]=n[c],s=!0,l=0;l<o.length;l++)(!1&r||a>=r)&&Object.keys(t.O).every((n=>t.O[n](o[l])))?o.splice(l--,1):(s=!1,r<a&&(a=r));if(s){n.splice(c--,1);var d=i();void 0!==d&&(e=d)}}return e}r=r||0;for(var c=n.length;c>0&&n[c-1][2]>r;c--)n[c]=n[c-1];n[c]=[o,i,r]},t.n=n=>{var e=n&&n.__esModule?()=>n.default:()=>n;return t.d(e,{a:e}),e},t.d=(n,e)=>{for(var o in e)t.o(e,o)&&!t.o(n,o)&&Object.defineProperty(n,o,{enumerable:!0,get:e[o]})},t.o=(n,e)=>Object.prototype.hasOwnProperty.call(n,e),(()=>{var n={887:0};t.O.j=e=>0===n[e];var e=(e,o)=>{var i,r,[a,s,l]=o,d=0;if(a.some((e=>0!==n[e]))){for(i in s)t.o(s,i)&&(t.m[i]=s[i]);if(l)var c=l(t)}for(e&&e(o);d<a.length;d++)r=a[d],t.o(n,r)&&n[r]&&n[r][0](),n[r]=0;return t.O(c)},o=self.webpackChunkpractical_forms=self.webpackChunkpractical_forms||[];o.forEach(e.bind(null,0)),o.push=e.bind(null,o.push.bind(o))})(),t.nc=void 0;var i=t.O(void 0,[871],(()=>t(841)));i=t.O(i)})();