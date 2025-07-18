// src/utils/baseApi.js

export class ApiUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiUnavailableError';
  }
}

export async function baseApi(endpoint, options = {}) {
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const url = `${baseUrl}${endpoint}`;
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      // If backend sent a message, use it
      const errorMsg = data.message || `API error: ${response.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    if (err instanceof TypeError || err.message.startsWith('API error')) {
      throw new ApiUnavailableError('API unavailable');
    }
    throw err;
  }
} 