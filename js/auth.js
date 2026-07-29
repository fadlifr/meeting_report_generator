(function() {
  const STYLES = `
    #auth-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, #1e293b, #0f172a);
      z-index: 99999; display: flex; align-items: center; justify-content: center;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .auth-card {
      background: white; padding: 40px; border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4); text-align: center; max-width: 400px; width: 90%;
    }
    .auth-card h2 { margin: 0 0 10px; color: #1e293b; font-size: 24px; font-weight: 800; }
    .auth-card p { color: #64748b; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
    .auth-card input {
      width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px;
      font-size: 16px; font-family: inherit; margin-bottom: 16px; transition: border 0.3s;
      box-sizing: border-box; text-align: center; letter-spacing: 2px;
    }
    .auth-card input:focus { border-color: #22c55e; outline: none; }
    .auth-card button {
      width: 100%; padding: 14px; background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700;
      cursor: pointer; transition: transform 0.2s;
    }
    .auth-card button:hover { filter: brightness(1.1); transform: scale(0.98); }
    .auth-error { color: #ef4444; font-size: 13px; font-weight: 700; margin-top: 12px; display: none; }
  `;

  function initAuth() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.innerHTML = `
      <div class="auth-card">
        <h2>Timedoor Internal</h2>
        <p>Please enter the access password to view curriculum templates.</p>
        <form id="auth-form">
          <input type="password" id="auth-pass" placeholder="••••••••" required autofocus>
          <button type="submit">Unlock</button>
          <div id="auth-error" class="auth-error">Incorrect password. Access denied.</div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('auth-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const pass = document.getElementById('auth-pass').value;
      attemptUnlock(pass);
    });
  }

  function attemptUnlock(password) {
    try {
      if (typeof SECURE_PAYLOAD === 'undefined') {
        throw new Error("SECURE_PAYLOAD not found. Ensure secure_data.js is loaded.");
      }
      
      const decoded = atob(SECURE_PAYLOAD);
      const passBuf = new TextEncoder().encode(password);
      const dataBuf = new Uint8Array(decoded.length);
      for(let i=0; i<decoded.length; i++) {
        dataBuf[i] = decoded.charCodeAt(i) ^ passBuf[i % passBuf.length];
      }
      
      const decrypted = new TextDecoder('utf-8').decode(dataBuf);
      const data = JSON.parse(decrypted);
      
      // Verification successful, bind globals
      window.COURSE_DATA = data.COURSE_DATA;
      window.COURSE_MAP = data.COURSE_MAP;
      window.TEMPLATES = data.TEMPLATES;
      window.TEMPLATES_EN = data.TEMPLATES_EN;
      
      // Store in session
      sessionStorage.setItem('td_key', password);
      
      // Remove overlay
      const overlay = document.getElementById('auth-overlay');
      if (overlay) overlay.remove();
      
      // Init app if function exists
      if (typeof window.initApp === 'function') {
        window.initApp();
      }
      if (typeof window.initReviewApp === 'function') {
        window.initReviewApp();
      }

    } catch (e) {
      const errEl = document.getElementById('auth-error');
      if (errEl) {
        errEl.style.display = 'block';
        errEl.textContent = 'Incorrect password or corrupted data.';
      }
      sessionStorage.removeItem('td_key');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const savedKey = sessionStorage.getItem('td_key');
    if (savedKey) {
      // Try to unlock silently
      try {
        const decoded = atob(SECURE_PAYLOAD);
        const passBuf = new TextEncoder().encode(savedKey);
        const dataBuf = new Uint8Array(decoded.length);
        for(let i=0; i<decoded.length; i++) {
          dataBuf[i] = decoded.charCodeAt(i) ^ passBuf[i % passBuf.length];
        }
        const decrypted = new TextDecoder('utf-8').decode(dataBuf);
        const data = JSON.parse(decrypted);
        window.COURSE_DATA = data.COURSE_DATA;
        window.COURSE_MAP = data.COURSE_MAP;
        window.TEMPLATES = data.TEMPLATES;
        window.TEMPLATES_EN = data.TEMPLATES_EN;
        
        if (typeof window.initApp === 'function') window.initApp();
        if (typeof window.initReviewApp === 'function') window.initReviewApp();
        return;
      } catch(e) {
        // Silent fail, show UI
      }
    }
    initAuth();
  });

})();
