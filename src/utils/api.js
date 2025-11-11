// Native fetch-based API utility - replaces axios
// No external dependencies, no build issues

class ApiClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Build headers with auth token
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle response
  async handleResponse(response) {
    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'GET',
      headers: this.getHeaders(config.headers),
      ...config,
    });

    return this.handleResponse(response);
  }

  // POST request
  async post(url, data, config = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers: this.getHeaders(config.headers),
      body: JSON.stringify(data),
      ...config,
    });

    return this.handleResponse(response);
  }

  // PUT request
  async put(url, data, config = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers: this.getHeaders(config.headers),
      body: JSON.stringify(data),
      ...config,
    });

    return this.handleResponse(response);
  }

  // PATCH request
  async patch(url, data, config = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PATCH',
      headers: this.getHeaders(config.headers),
      body: JSON.stringify(data),
      ...config,
    });

    return this.handleResponse(response);
  }

  // DELETE request
  async delete(url, config = {}) {
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers: this.getHeaders(config.headers),
      ...config,
    });

    return this.handleResponse(response);
  }

  // POST with FormData (for file uploads)
  async postFormData(url, formData, config = {}) {
    const headers = { ...config.headers };
    const token = this.getAuthToken();
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
const api = new ApiClient('/api');

// Also export the class for custom instances
export { ApiClient };
export default api;
