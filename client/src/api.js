// api.js
export function apiFetch(input, init) {
  let url = input;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof input === 'string' && input.startsWith('/api')) {
    url = baseUrl.replace(/\/$/, '') + input;
  }
  return fetch(url, init);
} 