/* eslint-disable no-unused-vars */
class ApiClient {
  constructor() {
    this.baseURL = "http://localhost:5000/api/v1";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  async customFetch(endpoint, options) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = { ...this.defaultHeaders, ...options.headers };

      const config = {
        ...options,
        headers,
        credentials: "include",
      };

      console.log(`Fetching ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Api error", error);
      throw error;
    }
  }

  async signup(name, email, password) {
    return this.customFetch("/users/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email, password) {
    return this.customFetch("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logOut() {
    return this.customFetch("/users/logout", {
      method: "GET",
    });
  }

  async getMe() {
    return this.customFetch("/users/profile", {
      method: "GET",
    });
  }
}

const apiClient = new ApiClient();
export default apiClient;
