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

  // Use this for any Admin/Super Admin action
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