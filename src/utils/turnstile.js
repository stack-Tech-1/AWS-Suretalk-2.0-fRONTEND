// Cloudflare Turnstile — bot check for signup, password reset, verification emails and SMS codes.
// getTurnstileToken() runs the check on demand and resolves with a one-time token for the backend.
// Real visitors usually see nothing; a small challenge appears only when Cloudflare is unsure.
// Returns null when NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured (the backend then skips the check
// as long as TURNSTILE_SECRET_KEY is also unset).
const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

let scriptPromise = null;

function loadScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Turnstile needs a browser'));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load the security check'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export async function getTurnstileToken(action) {
  if (!SITE_KEY) return null;

  const turnstile = await loadScript();

  // Container for the challenge UI, shown only if Cloudflare needs the visitor to interact
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9999;';
  document.body.appendChild(container);

  try {
    return await new Promise((resolve, reject) => {
      const widgetId = turnstile.render(container, {
        sitekey: SITE_KEY,
        action,
        appearance: 'interaction-only',
        execution: 'execute',
        callback: resolve,
        'error-callback': () => reject(new Error('Security check failed. Please try again.')),
        'timeout-callback': () => reject(new Error('Security check timed out. Please try again.')),
      });
      turnstile.execute(widgetId);
      container.dataset.widgetId = widgetId;
    });
  } finally {
    try { turnstile.remove(container.dataset.widgetId); } catch {}
    container.remove();
  }
}
