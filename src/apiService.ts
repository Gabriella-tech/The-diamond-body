const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper to get auth headers
const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return {
    'Content-Type': 'application/json',
    ...(user.token ? { 'Authorization': `Bearer ${user.token}` } : {})
  };
};

export const apiService = {
  // --- ADDED THESE TWO FUNCTIONS ---
  async login(credentials: any) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Login failed');
    return await response.json();
  },

  async register(userData: any) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Registration failed');
    return await response.json();
  },
  // ---------------------------------

  async getProducts() {
    try {
      const response = await fetch(`${BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error("API Error (getProducts):", error);
      return [];
    }
  },

  async postAuthorized(endpoint: string, data: any) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Unauthorized or request failed');
    return await response.json();
  },

  async createOrder(orderData: any) {
    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      });
      if (!response.ok) throw new Error('Failed to create order');
      return await response.json();
    } catch (error) {
      console.error("API Error (createOrder):", error);
      return null;
    }
  }
};