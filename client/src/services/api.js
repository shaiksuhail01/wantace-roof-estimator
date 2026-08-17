const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include',
      ...options,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Something went wrong.'
    );
  }

  return data;
};

export const getConfig = async () => {
  return request('/config');
};

export const createEstimate = async (payload) => {
  return request('/estimate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};