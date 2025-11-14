import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../../services/instance';

// Initial state
const initialState = {
  items: [],
  categories: [],
  lowStockProducts: [],
  pagination: { page: 1, limit: 50, total: 0, pages: 0 },
  loading: false,
  error: null,
  success: false
};

// Helper to get auth config
const getAuthConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// --- Async Thunks ---

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const token = getState().login?.token;
      if (!token) throw new Error('No auth token');
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 50,
        ...(params.search && { search: params.search }),
        ...(params.category && params.category !== 'all' && { category: params.category }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder }),
        ...(params.stockStatus && { stockStatus: params.stockStatus })
      });
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products?${queryParams}`, getAuthConfig(token));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products'
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      // Ensure manufacturing date is formatted correctly
      const formattedProductData = {
        ...productData,
        manufacturingDate: productData.manufacturingDate ? new Date(productData.manufacturingDate).toISOString() : null,
      };

      const response = await axiosInstance.post("/products", formattedProductData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create product'
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const formattedProductData = {
        ...productData,
        manufacturingDate: productData.manufacturingDate ? new Date(productData.manufacturingDate).toISOString() : null,
      };

      const response = await axiosInstance.put(`/products/${id}`, formattedProductData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update product'
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().login?.token;
      if (!token) throw new Error('No auth token');
      const productResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`, getAuthConfig(token));
      const product = productResponse.data;
      if (product.image && product.image.includes('storage.googleapis.com')) {
        try {
          await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/upload/image`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { imageUrl: product.image }
          });
        } catch (imageDeleteError) {
          console.warn('Could not delete image, but continuing.', imageDeleteError.message);
        }
      }
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`, getAuthConfig(token));
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

// --- Slice Definition ---

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = false; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => { state.loading = true; })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.items.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProduct.pending, (state) => { state.loading = true; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.items.findIndex(p => p._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => { state.loading = true; })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.items = state.items.filter(p => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess } = productSlice.actions;
export default productSlice.reducer;