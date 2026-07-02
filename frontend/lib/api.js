// Set once by AppShell on mount so any `upgradeRequired` response (a locked
// module, or a plan usage limit reached) can surface the upgrade modal
// automatically, without every single call site needing to check for it.
let upgradeHandler = null;
export function setUpgradeHandler(fn) {
  upgradeHandler = fn;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (data.upgradeRequired && upgradeHandler) upgradeHandler(data);
    const err = new Error(data.error || 'Request failed.');
    err.upgradeRequired = !!data.upgradeRequired;
    throw err;
  }
  return data;
}

export async function ensureAuthenticatedSession({ attempts = 5, initialDelayMs = 150 } = {}) {
  let lastError = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      await Promise.all([
        apiFetch('/api/v1/auth/me'),
        apiFetch('/api/v1/modules'),
      ]);
      return;
    } catch (err) {
      lastError = err;
      if (attempt === attempts - 1) break;
      await delay(initialDelayMs * (attempt + 1));
    }
  }

  throw new Error(lastError?.message || 'We could not finish signing you in.');
}
