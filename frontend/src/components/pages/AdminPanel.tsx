import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAdmin } from '../../context/AdminContext';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../context/AuthContext';
import { useCategories } from '../../context/CategoryContext';
import { useProduct } from '../../context/ProductContext';

const AdminPanel: React.FC<{}> = () => {
  //From Admin Context
  const {
    handleImageUpload,
    uploadingImage,
    errorMessage,
    setNewProduct,
    newProduct,
    addProduct,
    deleteProduct,
    updateProduct,
    addCategory,
    newCategoryName,
    setNewCategoryName,
  } = useAdmin();
  const { authUser } = useAuth();
  const { products, setProducts, fetchProducts } = useProduct();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState<string>('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [isAdding, setIsAdding] = useState(false);

  const { categories, setCategories, fetchCategories } = useCategories();

  useEffect(() => {
    fetchProducts(null);
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const validateNewProduct = () => {
    const errors: { [key: string]: string } = {};

    if (!newProduct.name.trim()) {
      errors.name = 'Product name is required.';
    }
    if (!newProduct.price || newProduct.price <= 0) {
      errors.price = 'Price must be greater than 0.';
    }
    if (newProduct.stock < 0) {
      errors.stock = 'Stock cannot be negative.';
    }
    if (!newProduct.categoryId) {
      errors.categoryId = 'Category is required.';
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleAddProduct = async () => {
    if (validateNewProduct()) {
      setIsAdding(true);
      try {
        await addProduct();
        setValidationErrors({});
        setPriceInput('0.00');
      } catch (error) {
        console.error('Error adding product:', error);
        toast.error('Failed to add product. Please try again.');
      } finally {
        setIsAdding(false);
      }
    }
  };

  if (authUser?.authType !== 'admin') {
    return <p>You do not have access to the Admin Panel.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="group relative">
        <button
          onClick={() => navigate('/account')}
          className="z-50 bg-transparent text-3xl text-gray-700 hover:text-blue-600"
          aria-label="Back to Account"
        >
          &larr;
        </button>
        <span className="absolute -top-8 left-0 z-50 rounded-lg bg-gray-800 px-3 py-1 text-sm text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
          Back to Account
        </span>
      </div>
      <h1 className="mb-6 text-center text-3xl font-extrabold text-blue-700">
        Admin Panel
      </h1>

      {/* Add Product Section */}
      <div className="mb-10 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 border-b pb-2 text-2xl font-semibold">
          Add Product
        </h2>
        {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div className="flex flex-col">
            <label className="mb-1 block font-semibold text-gray-600">
              Product Name
            </label>
            <input
              type="text"
              placeholder="Enter the product name"
              value={newProduct.name}
              onChange={(e) => {
                setNewProduct({ ...newProduct, name: e.target.value });
                // Clear the error if the input is no longer empty
                if (e.target.value.trim()) {
                  setValidationErrors((prev) => {
                    const { name: _, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.name}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block font-semibold text-gray-600">
              Price (CHF)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter the price"
              value={priceInput}
              onChange={(e) => {
                const value = e.target.value.replace(',', '.');
                if (/^\d*\.?\d*$/.test(value)) {
                  setPriceInput(value);
                  const numericValue = parseFloat(value);

                  setNewProduct({
                    ...newProduct,
                    price: isNaN(numericValue) ? 0 : numericValue,
                  });

                  if (!isNaN(numericValue) && numericValue > 0) {
                    setValidationErrors((prev) => {
                      const { price: _, ...rest } = prev;
                      return rest;
                    });
                  }
                }
              }}
              onBlur={() => {
                const numericValue = parseFloat(priceInput);
                const formattedValue = isNaN(numericValue)
                  ? '0.00'
                  : numericValue.toFixed(2);
                setPriceInput(formattedValue);
                setNewProduct({
                  ...newProduct,
                  price: parseFloat(formattedValue),
                });
              }}
              className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {validationErrors.price && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.price}
              </p>
            )}
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1 block font-semibold text-gray-600">
              Stock
            </label>
            <input
              type="number"
              placeholder="Enter the stock quantity"
              value={newProduct.stock}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  stock: parseInt(e.target.value) || 0,
                })
              }
              className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label className="mb-1 block font-semibold text-gray-600">
              Category
            </label>
            {isAddingNewCategory ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter new category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  onClick={async () => {
                    if (
                      categories.some(
                        (cat) =>
                          cat.name.toLowerCase() ===
                          newCategoryName.trim().toLowerCase(),
                      )
                    ) {
                      toast.error('Category already exists!', {
                        autoClose: 2000,
                      });
                      return;
                    }

                    if (newCategoryName.trim()) {
                      const newCategoryId = await addCategory(
                        newCategoryName.trim(),
                      );
                      const newCategory = {
                        id: newCategoryId,
                        name: newCategoryName.trim(),
                      };

                      // Add the new category to the list and set as selected
                      setCategories((prevCategories) => {
                        if (
                          !prevCategories.some(
                            (category) => category.id === newCategory.id,
                          )
                        ) {
                          return [...prevCategories, newCategory];
                        }
                        return prevCategories;
                      });

                      setNewProduct({
                        ...newProduct,
                        categoryId: newCategoryId,
                      });

                      setValidationErrors((prev) => {
                        const { categoryId: _categoryId, ...rest } = prev; // Use an underscore prefix
                        return rest;
                      });

                      setNewCategoryName('');
                      setIsAddingNewCategory(false);
                    }
                  }}
                  className="rounded-lg bg-green-500 px-3 py-2 text-white transition hover:bg-green-600"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setNewCategoryName('');
                    setIsAddingNewCategory(false);
                  }}
                  className="text-sm text-gray-600 hover:text-red-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={newProduct.categoryId}
                onChange={(e) => {
                  const selectedValue = e.target.value;

                  if (selectedValue === 'add-new-category') {
                    setIsAddingNewCategory(true); // Show input for new category
                  } else {
                    // Update the newProduct state with the selected category ID
                    setNewProduct({ ...newProduct, categoryId: selectedValue });

                    // Clear the error if a valid category is selected
                    if (selectedValue) {
                      setValidationErrors((prev) => {
                        const { categoryId: _, ...rest } = prev;
                        return rest;
                      });
                    }
                  }
                }}
                className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
                <option value="add-new-category" className="text-blue-600">
                  + Add New Category
                </option>
              </select>
            )}
            {validationErrors.categoryId && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.categoryId}
              </p>
            )}
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1 block font-semibold text-gray-600">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
              className="w-full rounded-lg border p-3"
            />
            {uploadingImage && (
              <p className="mt-2 text-blue-500">Uploading image...</p>
            )}
          </div>
          <div className="col-span-full">
            <label className="mb-1 block font-semibold text-gray-600">
              Description
            </label>
            <textarea
              placeholder="Enter the product description"
              value={newProduct.description || ''}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="col-span-full">
            <label className="mb-1 block font-semibold text-gray-600">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              placeholder="Keywords, separated by commas"
              value={newProduct.keywords?.join(', ') || ''}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  keywords: e.target.value.split(',').map((kw) => kw.trim()),
                })
              }
              className="w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
        <button
          onClick={handleAddProduct}
          disabled={isAdding}
          className={`mt-6 rounded-lg bg-blue-600 px-6 py-2 font-bold text-white transition duration-300 hover:bg-blue-700 ${
            isAdding ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {isAdding ? 'Adding Product...' : 'Add Product'}
        </button>
      </div>

      {/* Product List */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 border-b pb-2 text-2xl font-semibold">Products</h2>

        <div className="hidden grid-cols-[1.5fr_1fr_1fr_0.75fr_3fr_1fr_1fr] rounded-t-lg bg-blue-200 p-3 font-bold text-blue-800 md:grid">
          <span>Product Name</span>
          <span className="-ml-1">Price (CHF)</span>
          <span className="ml-1">Stock</span>
          <span className="-ml-1">Category</span>
          <span>Description</span>
          <span>Keywords</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-gray-200">
          {products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-1 items-center gap-4 rounded-md p-4 transition hover:bg-gray-100 md:grid-cols-[1.5fr_1fr_1fr_0.75fr_3fr_1fr_1fr]"
            >
              {editingProductId === product.id ? (
                <>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((p) =>
                          p.id === product.id
                            ? { ...p, name: e.target.value }
                            : p,
                        ),
                      )
                    }
                    className="w-full rounded-md border p-2"
                  />
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((p) =>
                          p.id === product.id
                            ? { ...p, price: parseFloat(e.target.value) || 0 }
                            : p,
                        ),
                      )
                    }
                    className="w-full rounded-md border p-2"
                  />
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((p) =>
                          p.id === product.id
                            ? { ...p, stock: parseInt(e.target.value) || 0 }
                            : p,
                        ),
                      )
                    }
                    className="w-full rounded-md border p-2"
                  />
                  <select
                    value={product.categoryId}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((p) =>
                          p.id === product.id
                            ? { ...p, categoryId: e.target.value }
                            : p,
                        ),
                      )
                    }
                    className="w-full rounded-md border p-2"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Enter the product description"
                    value={product.description || ''}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((p) =>
                          p.id === product.id
                            ? { ...p, description: e.target.value }
                            : p,
                        ),
                      )
                    }
                    className="h-20 w-full rounded-md border p-2"
                  />
                  <input
                    type="text"
                    placeholder="Enter keywords, separated by commas"
                    value={product.keywords?.join(', ') || ''}
                    onChange={(e) =>
                      setProducts((prev) =>
                        prev.map((p) =>
                          p.id === product.id
                            ? {
                                ...p,
                                keywords: e.target.value
                                  .split(',')
                                  .map((kw) => kw.trim()),
                              }
                            : p,
                        ),
                      )
                    }
                    className="w-[110%] rounded-md border p-2"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      className="flex items-center rounded-md bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                      onClick={() => {
                        updateProduct(product.id, {
                          ...product,
                          categoryId:
                            categories.find(
                              (cat) => cat.id === product.categoryId,
                            )?.id || '',
                        });
                        setEditingProductId(null);
                      }}
                    >
                      <FaSave className="mr-1" /> Save
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="font-semibold">{product.name}</span>
                  <span>{product.price.toFixed(2)} CHF</span>
                  <span
                    className={`ml-2 ${
                      product.stock === 0
                        ? 'font-bold text-red-500'
                        : 'text-gray-700'
                    }`}
                  >
                    {product.stock}
                  </span>

                  <span className="text-sm">
                    {categories.find((cat) => cat.id === product.categoryId)
                      ?.name || 'Unknown'}
                  </span>

                  {/* Description section with line-clamp */}
                  <span className="line-clamp-3 max-h-16 overflow-hidden text-sm italic text-gray-700">
                    {product.description || 'No description'}
                  </span>

                  <span className="text-sm">
                    {product.keywords?.join(', ') || 'No keywords'}
                  </span>

                  <div className="flex justify-end gap-2">
                    <button
                      className="flex items-center rounded-md bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                      onClick={() => setEditingProductId(product.id)}
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      className="flex items-center rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                      onClick={() =>
                        deleteProduct(product.id, product.imageUrl)
                      }
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
