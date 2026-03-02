import instance from '../../../services/instance';

const API_URL = '/branches';

// Create a new branch
const createBranch = async (branchData) => {
    const response = await instance.post(API_URL, branchData);
    return response.data;
};

// Get all branches
const getAllBranches = async () => {
    const response = await instance.get(API_URL);
    return response.data;
};

// Get single branch
const getBranchById = async (id) => {
    const response = await instance.get(`${API_URL}/${id}`);
    return response.data;
};

// Update branch
const updateBranch = async (id, branchData) => {
    const response = await instance.put(`${API_URL}/${id}`, branchData);
    return response.data;
};

// Delete branch
const deleteBranch = async (id) => {
    const response = await instance.delete(`${API_URL}/${id}`);
    return response.data;
};

const branchService = {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch,
};

export default branchService;
