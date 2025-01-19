import React, { useState, useEffect } from "react"; 
import {useAuth} from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { useAdmin } from "../../context/AdminContext";
import { useProduct} from "../../context/ProductContext";
import {useCategories} from "../../context/CategoryContext";


const AdminPanel:React.FC<{}> = ({}) => {
    
   //From Admin Context
   const {handleImageUpload, uploadingImage, errorMessage,setNewProduct, newProduct, addProduct,  deleteProduct, updateProduct, addCategory, newCategoryName, setNewCategoryName } = useAdmin();
   const { authUser} = useAuth();
   const {products,   setProducts, fetchProducts} = useProduct();
   const [editingProductId, setEditingProductId] = useState<string | null>(null);
   const [priceInput, setPriceInput] = useState<string>("");
   const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
   const navigate = useNavigate();
   
   
   const {categories, setCategories, fetchCategories} = useCategories();
   

   useEffect(() => {
    console.log("!!!!!!!!!!!!!!!!!!AdminPanel:useEffect:fetchProducts!!!!!!!!!!!!!!!");
       fetchProducts(null);  
       fetchCategories();

    }, [fetchProducts, fetchCategories]);


    if (authUser?.authType !== "admin") {
      return <p>You do not have access to the Admin Panel.</p>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="relative group">
                <button
                    onClick={() => navigate("/account")}
                    className="text-3xl bg-transparent text-gray-700 hover:text-blue-600 z-50"
                    aria-label="Back to Account"
                >
                    &larr;
                </button>
                <span className="absolute opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-sm rounded-lg py-1 px-3 shadow-lg transition-opacity duration-300 -top-8 left-0 z-50">
        Back to Account
    </span>
            </div>
            <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700">Admin Panel</h1>

            {/* Add Product Section */}
            <div className="mb-10 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Add Product</h2>
                {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col">
                    <label className="block font-semibold mb-1 text-gray-600">Product Name</label>
                        <input
                            type="text"
                            placeholder="Enter the product name"
                            value={newProduct.name}
                            onChange={(e) =>
                                setNewProduct({ ...newProduct, name: e.target.value })
                            }
                            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1 text-gray-600">Price (CHF)</label>
                        <input
                            type="text"
                            placeholder="Enter the price"
                            value={priceInput}
                            onChange={(e) => {
                                const value = e.target.value;

                                // Allow only valid numeric characters (including . for decimals)
                                if (/^\d*\.?\d{0,2}$/.test(value)) {
                                    setPriceInput(value);  // Set as string during typing
                                    setNewProduct({ ...newProduct, price: parseFloat(value) || 0 });
                                }
                            }}
                            onBlur={() => {
                                // Exit edit mode when the user clicks away
                                if (!priceInput || isNaN(parseFloat(priceInput))) {
                                    setPriceInput(newProduct.price.toFixed(2));
                                    // Default to 0.00 if empty or invalid
                                    setNewProduct({ ...newProduct, price: 0 });
                                }
                                if (priceInput.trim() !== "") setEditingProductId(null);
                            }}
                            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                    <div className="sm:col-span-1">
                        <label className="block font-semibold mb-1 text-gray-600">Stock</label>
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
                            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1 text-gray-600">Category</label>
                        {isAddingNewCategory ? (
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    placeholder="Enter new category name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                                <button
                                    onClick={async () => {
                                        if (newCategoryName.trim()) {
                                            const newCategoryId = await addCategory(newCategoryName.trim());
                                            const newCategory = { id: newCategoryId, name: newCategoryName.trim() };

                                            // Add the new category to the list and set as selected
                                            setCategories((prevCategories) => {
                                                if (!prevCategories.some((category) => category.id === newCategory.id)) {
                                                    return [...prevCategories, newCategory];
                                                }
                                                return prevCategories;
                                            });

                                            setNewProduct({ ...newProduct, categoryId: newCategoryId });
                                            setNewCategoryName("");
                                            setIsAddingNewCategory(false);
                                        }
                                    }}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition"
                                >
                                Add
                                </button>
                                <button
                                    onClick={() => {
                                        setNewCategoryName("");
                                        setIsAddingNewCategory(false);
                                    }}
                                    className="text-gray-600 hover:text-red-600 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <select
                                value={newProduct.categoryId}
                                onChange={(e) => {
                                    if (e.target.value === "add-new-category") {
                                        setIsAddingNewCategory(true); // Show input for new category
                                    } else {
                                        setNewProduct({ ...newProduct, categoryId: e.target.value });
                                    }
                                }}
                                className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                    </div>

                    <div className="sm:col-span-1">
                        <label className="block font-semibold mb-1 text-gray-600">Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    handleImageUpload(e.target.files[0]);
                                }
                            }}
                            className="border rounded-lg p-3 w-full"
                        />
                        {uploadingImage && <p className="text-blue-500 mt-2">Uploading image...</p>}
                    </div>
                    <div className="col-span-full">
                        <label className="block font-semibold mb-1 text-gray-600">Description</label>
                        <textarea
                            placeholder="Enter the product description"
                            value={newProduct.description || ""}
                            onChange={(e) =>
                                setNewProduct({ ...newProduct, description: e.target.value })
                            }
                            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                    <div className="col-span-full">
                        <label className="block font-semibold mb-1 text-gray-600">Keywords (comma-separated)</label>
                        <input
                            type="text"
                            placeholder="Keywords, separated by commas"
                            value={newProduct.keywords?.join(", ") || ""}
                            onChange={(e) =>
                                setNewProduct({
                                    ...newProduct,
                                    keywords: e.target.value.split(",").map((kw) => kw.trim()),
                                })
                            }
                            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                </div>
                <button onClick={addProduct} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-6 py-2 mt-6 transition duration-300">
                    Add Product
                </button>
            </div>

            {/* Product List */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Products</h2>

                <div className="hidden md:grid grid-cols-7 bg-blue-200 text-blue-800 font-bold p-3 rounded-t-lg">
                    <span>Product Name</span>
                    <span>Price (CHF)</span>
                    <span>Stock</span>
                    <span>Category</span>
                    <span>Description</span>
                    <span>Keywords</span>
                    <span className="text-right">Actions</span>
                </div>

                <div className="divide-y divide-gray-200">
                    {products.map((product) => (
                        <div key={product.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 items-center hover:bg-gray-100 transition rounded-md">
                            {editingProductId === product.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={product.name}
                                        onChange={(e) =>
                                            setProducts((prev) =>
                                                prev.map((p) =>
                                                    p.id === product.id ? { ...p, name: e.target.value } : p
                                                )
                                            )
                                        }
                                        className="border p-2 rounded-md"
                                    />
                                    <input
                                        type="number"
                                        value={product.price}
                                        onChange={(e) =>
                                            setProducts((prev) =>
                                                prev.map((p) =>
                                                    p.id === product.id ? { ...p, price: parseFloat(e.target.value) || 0 } : p
                                                )
                                            )
                                        }
                                        className="border p-2 rounded-md"
                                    />
                                    <input
                                        type="number"
                                        value={product.stock}
                                        onChange={(e) =>
                                            setProducts((prev) =>
                                                prev.map((p) =>
                                                    p.id === product.id ? { ...p, stock: parseInt(e.target.value) || 0 } : p
                                                )
                                            )
                                        }
                                        className="border p-2 rounded-md"
                                    />
                                    <select
                                        value={product.categoryId}
                                        onChange={(e) =>
                                            setProducts((prev) =>
                                                prev.map((p) =>
                                                    p.id === product.id ? { ...p, categoryId: e.target.value } : p
                                                )
                                            )
                                        }
                                        className="border p-2 rounded-md"
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
                                        value={product.description || ""}
                                        onChange={(e) =>
                                            setProducts((prev) =>
                                                prev.map((p) =>
                                                    p.id === product.id ? { ...p, description: e.target.value } : p
                                                )
                                            )
                                        }
                                        className="border p-2 rounded-md h-20"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Enter keywords, separated by commas"
                                        value={product.keywords?.join(", ") || ""}
                                        onChange={(e) =>
                                            setProducts((prev) =>
                                                prev.map((p) =>
                                                    p.id === product.id ? { ...p, keywords: e.target.value.split(",").map((kw) => kw.trim()) } : p
                                                )
                                            )
                                        }
                                        className="border p-2 rounded-md"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md flex items-center text-sm"
                                            onClick={() => {
                                                updateProduct(product.id, {
                                                    ...product,
                                                    categoryId: categories.find((cat) => cat.id === product.categoryId)?.id || "",
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
                                    <span>{product.stock}</span>
                                    <span className="text-sm">{categories.find((cat) => cat.id === product.categoryId)?.name || "Unknown"}</span>

                                    {/* Description section with line-clamp */}
                                    <span className="text-sm italic text-gray-700 overflow-hidden line-clamp-3 max-h-16">
                        {product.description || "No description"}
                    </span>

                                    <span className="text-sm">{product.keywords?.join(", ") || "No keywords"}</span>

                                    <div className="flex gap-2 justify-end">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center text-sm"
                                            onClick={() => setEditingProductId(product.id)}
                                        >
                                            <FaEdit className="mr-1" /> Edit
                                        </button>
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center text-sm"
                                            onClick={() => deleteProduct(product.id, product.imageUrl)}
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
