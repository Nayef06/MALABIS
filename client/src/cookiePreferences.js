export const COOKIE_PREFERENCES_KEY = 'malabis:cookie-preferences:v1';

export const defaultCookiePreferences = {
  analytics: false,
  personalization: false,
};

export function getCookiePreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(COOKIE_PREFERENCES_KEY));
    return {
      analytics: stored?.analytics === true,
      personalization: stored?.personalization === true,
    };
  } catch {
    return { ...defaultCookiePreferences };
  }
}

export function saveCookiePreferences(preferences) {
  const value = {
    analytics: preferences.analytics === true,
    personalization: preferences.personalization === true,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(value));
  } catch {
    // The controls still work for this visit when local storage is unavailable.
  }

  window.dispatchEvent(new CustomEvent('malabis:cookie-preferences', { detail: value }));
  return value;
}
