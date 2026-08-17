const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

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

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message: 'Invalid server response.',
    };
  }

  if (!response.ok) {
    throw new Error(
      data.message || 'Something went wrong.'
    );
  }

  return data;
};

// Public
export const getConfig = async () => {
  return request('/config');
};

export const createEstimate = async (payload) => {
  return request('/estimate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// Authentication
export const loginAdmin = async (payload) => {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getCurrentAdmin = async () => {
  return request('/auth/me');
};

export const logoutAdmin = async () => {
  return request('/auth/logout', {
    method: 'POST',
  });
};

// Admin configuration
export const getAdminConfig = async () => {
  return request('/config/admin');
};

export const updateAdminConfig = async (payload) => {
  return request('/config/admin', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

// Admin leads
export const getLeads = async () => {
  return request('/leads');
};

export const getLeadById = async (leadId) => {
  return request(`/leads/${leadId}`);
};