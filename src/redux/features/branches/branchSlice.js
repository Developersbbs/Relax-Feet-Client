import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import branchService from './branchService';

const initialState = {
    branches: [],
    selectedBranch: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Create new branch
export const createBranch = createAsyncThunk(
    'branches/create',
    async (branchData, thunkAPI) => {
        try {
            return await branchService.createBranch(branchData);
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get all branches
export const getBranches = createAsyncThunk(
    'branches/getAll',
    async (_, thunkAPI) => {
        try {
            return await branchService.getAllBranches();
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update branch
export const updateBranch = createAsyncThunk(
    'branches/update',
    async ({ id, branchData }, thunkAPI) => {
        try {
            return await branchService.updateBranch(id, branchData);
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete branch
export const deleteBranch = createAsyncThunk(
    'branches/delete',
    async (id, thunkAPI) => {
        try {
            await branchService.deleteBranch(id);
            return id;
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const branchSlice = createSlice({
    name: 'branch',
    initialState,
    reducers: {
        reset: (state) => {
            state.isError = false;
            state.isSuccess = false;
            state.isLoading = false;
            state.message = '';
        },
        clearSelectedBranch: (state) => {
            state.selectedBranch = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createBranch.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createBranch.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.branches.unshift(action.payload);
            })
            .addCase(createBranch.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getBranches.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getBranches.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // Normalize: API may return array directly or wrapped in an object
                const payload = action.payload;
                state.branches = Array.isArray(payload) ? payload : (payload?.branches || payload?.data || []);
            })
            .addCase(getBranches.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateBranch.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateBranch.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.branches = state.branches.map((branch) =>
                    branch._id === action.payload._id ? action.payload : branch
                );
            })
            .addCase(updateBranch.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deleteBranch.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteBranch.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.branches = state.branches.filter(
                    (branch) => branch._id !== action.payload
                );
            })
            .addCase(deleteBranch.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset, clearSelectedBranch } = branchSlice.actions;
export default branchSlice.reducer;
