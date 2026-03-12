import { apiClient } from '../api/client';

function getApiErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export async function signup(payload) {
  try {
    const response = await apiClient.post('/api/auth/signup', payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Signup failed. Please try again.'));
  }
}

export async function signin(payload) {
  try {
    const response = await apiClient.post('/api/auth/signin', payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Signin failed. Please try again.'));
  }
}

export async function googleAuth(idToken) {
  try {
    const response = await apiClient.post('/api/auth/google', { idToken });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Google authentication failed. Please try again.'));
  }
}

export async function getMe() {
  try {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load user session.'));
  }
}

