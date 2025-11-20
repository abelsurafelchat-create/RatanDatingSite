// React Native API utility using fetch
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config';

class ApiClient {
  constructor(baseURL = API_URL + '/api') {
    this.baseURL = baseURL;
  }

  // Get auth token from SecureStore
  async getAuthToken() {
    try {
      return await SecureStore.getItemAsync('token');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  // Build headers with auth token
  async getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = await this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle response
  async handleResponse(response) {
    // Handle 401 Unauthorized
    if (response.status === 401) {
      try {
        await SecureStore.deleteItemAsync('token');
      } catch (error) {
        console.error('Failed to remove token:', error);
      }
      throw new Error('Unauthorized');
    }

    // Parse JSON response
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Check if request was successful
    if (!response.ok) {
      const error = new Error(data.message || data.error || 'Request failed');
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  }

  // GET request
  async get(url, config = {}) {
    const headers = await this.getHeaders(config.headers);
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'GET',
      headers,
      ...config,
    });

    return this.handleResponse(response);
  }

  // POST request
  async post(url, data, config = {}) {
    const headers = await this.getHeaders(config.headers);
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      ...config,
    });

    return this.handleResponse(response);
  }

  // PUT request
  async put(url, data, config = {}) {
    const headers = await this.getHeaders(config.headers);
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      ...config,
    });

    return this.handleResponse(response);
  }

  // PATCH request
  async patch(url, data, config = {}) {
    const headers = await this.getHeaders(config.headers);
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
      ...config,
    });

    return this.handleResponse(response);
  }

  // DELETE request
  async delete(url, config = {}) {
    const headers = await this.getHeaders(config.headers);
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers,
      ...config,
    });

    return this.handleResponse(response);
  }

  // POST with FormData (for file uploads)
  async postFormData(url, formData, config = {}) {
    const headers = { ...config.headers };
    const token = await this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - browser will set it with boundary

    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers,
      body: formData,
      ...config,
    });

    return this.handleResponse(response);
  }
}

// Create and export a default instance
const api = new ApiClient();

// Also export the class for custom instances
export { ApiClient };
export default api;
