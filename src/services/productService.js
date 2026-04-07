import instance from './instance';

const productService = {
  // Get all products with optional filtering
  getAllProducts: async (params = {}) => {
    try {
      const response = await instance.get('/products', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await instance.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  // Get product categories
  getCategories: async () => {
    try {
      const response = await instance.get('/products/categories');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },

  // Get low stock products
  getLowStockProducts: async () => {
    try {
      const response = await instance.get('/products/stock/low-stock');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch low stock products');
    }
  },

  // Get product statistics for reports
  getProductStats: async () => {
    try {
      const response = await instance.get('/products/stats');
      return response.data;
    } catch (error) {
      // If stats endpoint doesn't exist, we'll calculate from products
      const products = await productService.getAllProducts();
      return productService.calculateStats(products.products || products);
    }
  },

  // Calculate statistics from product data
  calculateStats: (products) => {
    const stats = {
      total: products.length,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0,
      categories: {},
      priceRanges: {
        'Under ₹100': 0,
        '₹100-₹500': 0,
        '₹500-₹1000': 0,
        '₹1000-₹5000': 0,
        'Above ₹5000': 0
      }
    };

    products.forEach(product => {
      // Stock status
      if (product.quantity === 0) {
        stats.outOfStock++;
      } else if (product.quantity <= 10) {
        stats.lowStock++;
      } else {
        stats.inStock++;
      }

      // Total value
      stats.totalValue += product.price * product.quantity;

      // Categories
      const categoryName = product.category?.name || product.category || 'Unknown';
      stats.categories[categoryName] = (stats.categories[categoryName] || 0) + 1;

      // Price ranges
      if (product.price < 100) {
        stats.priceRanges['Under ₹100']++;
      } else if (product.price < 500) {
        stats.priceRanges['₹100-₹500']++;
      } else if (product.price < 1000) {
        stats.priceRanges['₹500-₹1000']++;
      } else if (product.price < 5000) {
        stats.priceRanges['₹1000-₹5000']++;
      } else {
        stats.priceRanges['Above ₹5000']++;
      }
    });

    return stats;
  }
};

export default productService;
