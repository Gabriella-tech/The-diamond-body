const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  async createOrder(orderData: any) {
    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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