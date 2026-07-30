(function() {
  const STYLES = `
    #auth-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: #ffffff;
      z-index: 99999; display: flex; flex-direction: row;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .auth-left {
      flex: 1; background: linear-gradient(135deg, #f0fdf4, #ccfbf1);
      display: flex; align-items: center; justify-content: center;
      padding: 40px; position: relative; overflow: hidden;
    }
    .auth-left::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 30%;
      background: linear-gradient(to top, rgba(204,251,241,0.5), transparent); pointer-events: none;
    }
    .auth-left img {
      width: 100%; max-width: 600px; height: auto; object-fit: contain;
      filter: drop-shadow(0 20px 40px rgba(0,0,0,0.15)); z-index: 2;
    }
    .auth-right {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 40px; background: #ffffff;
    }
    .auth-container {
      max-width: 420px; width: 100%;
    }
    .auth-header {
      margin-bottom: 32px; text-align: left;
    }
    .auth-header h1 {
      font-size: 36px; font-weight: 800; color: #0f172a; margin: 0 0 12px;
      letter-spacing: -1px; line-height: 1.2;
    }
    .auth-header p {
      font-size: 16px; color: #64748b; margin: 0; line-height: 1.6;
    }
    .auth-card {
      background: #ffffff; width: 100%;
    }
    .auth-card h2 { margin: 0 0 8px; color: #1e293b; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
    .auth-card p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
    .auth-card input {
      width: 100%; padding: 16px 20px; border: 2px solid #e2e8f0; border-radius: 12px;
      font-size: 18px; font-family: inherit; margin-bottom: 24px; transition: all 0.3s ease;
      box-sizing: border-box; text-align: left; letter-spacing: 2px;
      background: #f8fafc;
    }
    .auth-card input:focus { border-color: #22c55e; background: white; outline: none; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1); }
    .auth-card button {
      width: 100%; padding: 18px; background: linear-gradient(135deg, #22c55e, #16a34a);
      color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700;
      cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.25);
    }
    .auth-card button:hover { filter: brightness(1.05); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3); }
    .auth-error { color: #ef4444; font-size: 14px; font-weight: 700; margin-top: 16px; display: none; }
    @media (max-width: 900px) {
      #auth-overlay { flex-direction: column; }
      .auth-left { flex: none; height: 35vh; padding: 20px; }
      .auth-left img { max-height: 100%; max-width: 80%; }
      .auth-right { flex: 1; padding: 24px; justify-content: flex-start; padding-top: 40px; }
      .auth-header { text-align: center; }
      .auth-card input { text-align: center; }
    }
  `;

  function initAuth() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.innerHTML = `
      <div class="auth-left">
        <img src="img/cobee_cover.png" alt="Cobee Mascot">
      </div>
      <div class="auth-right">
        <div class="auth-container">
          <div class="auth-header">
            <h1>Meeting Report Generator</h1>
            <p>Streamline your class progress reporting and generate daily student updates instantly.</p>
          </div>
          <div class="auth-card">
            <h2>For Internal Timedoor Use Only</h2>
            <form id="auth-form">
              <input type="password" id="auth-pass" placeholder="Enter password" required autofocus>
              <button type="submit">Unlock Access</button>
              <div id="auth-error" class="auth-error">Incorrect password. Access denied.</div>
            </form>
          </div>
        </div>
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
