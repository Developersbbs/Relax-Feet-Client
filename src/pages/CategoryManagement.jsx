import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import categoryService from "../services/categoryService";

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.login?.user || null);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "active"
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      // Pass null to get all categories regardless of status
      const categoriesData = await categoryService.getAllCategories(null);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = "Category name is required";
    }

    if (formData.name?.trim().length < 2) {
      errors.name = "Category name must be at least 2 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryService.createCategory(formData);
      }

      // Reset form and refresh categories
      resetForm();
      await fetchCategories();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      status: category.status
    });
    setShowModal(true);
  };

  // Handle status toggle
  const handleStatusToggle = async (category) => {
    try {
      const newStatus = category.status === 'active' ? 'inactive' : 'active';
      await categoryService.toggleCategoryStatus(category.id, newStatus);
      await fetchCategories();
    } catch (error) {
      console.error('Error updating category status:', error);
      setError('Failed to update category status');
    }
  };

  // Handle delete
  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
      try {
        setLoading(true);
        await categoryService.deleteCategory(category.id);
        await fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        setError('Failed to delete category');
      } finally {
        setLoading(false);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      status: "active"
    });
    setEditingCategory(null);
    setFormErrors({});
  };

  const canModify = user?.role === "superadmin";

  return (
    <div className="p-4 sm:p-6 bg-red-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 flex items-center justify-between">
          <span className="text-sm sm:text-base">❌ {error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 ml-2 sm:ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2 sm:gap-3">
              <span className="bg-[#720000] p-1.5 sm:p-2 rounded-lg text-white text-sm sm:text-base">🏷️</span>
              <span className="truncate">Category Management</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Manage your product categories - {categories.length} categories total
            </p>
          </div>
          {canModify && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-[#720000] hover:bg-[#8a1a1a] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 min-w-0 whitespace-nowrap"
            >
              <span className="text-base sm:text-lg">➕</span>
              <span className="hidden sm:inline">Add New Category</span>
              <span className="sm:hidden">Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories Display */}
      {loading && categories.length === 0 ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#720000]"></div>
          <span className="ml-3 sm:ml-4 text-sm sm:text-base text-gray-600">Loading categories...</span>
        </div>
      ) : !loading && categories.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-4">🏷️</div>
          <p className="text-gray-600 text-base sm:text-lg">No categories found</p>
          {canModify && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="mt-3 sm:mt-4 bg-[#720000] hover:bg-[#8a1a1a] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base"
            >
              Create First Category
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-slate-700 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-bold text-[#720000] dark:text-white truncate flex-1 mr-2">
                  {category.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  category.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.status}
                </span>
              </div>

              {canModify && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="bg-[#720000] hover:bg-[#8a1a1a] text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleStatusToggle(category)}
                    className={`py-2 px-4 rounded-lg transition-colors font-medium text-sm sm:text-base ${
                      category.status === 'active'
                        ? 'bg-red-100 hover:bg-red-200 text-red-700'
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {category.status === 'active' ? '🚫 Deactivate' : '✅ Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium ml-3 transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {showModal && canModify && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 relative border-t-4 border-[#720000] overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <h2 className="text-xl font-bold text-[#720000] dark:text-white mb-6">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-400 hover:text-[#720000] dark:hover:text-[#a53838] ml-2"
              >✕</button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Category Name */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent ${formErrors.name ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Enter category name"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-4 sm:pt-6 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base order-1 sm:order-2 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-amber-700 hover:bg-amber-800 text-white shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
