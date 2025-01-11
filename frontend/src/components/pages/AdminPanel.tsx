import React, { useState, useEffect } from "react"; 
import {getFirestore, collection,addDoc, updateDoc,deleteDoc,doc, getDocs,} from "firebase/firestore"; 
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Product } from "../../types/product"; 
import {useAuth} from "../../context/AuthContext";
import Footer from "../layouts/Footer";
import {Category} from "../../types/category";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";

interface AdminPanelProps {
     loggedInUser: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ loggedInUser }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
        name: "",
        price: 0,
        weight: 0,
        imageUrl: "",
        categoryId: "",
        stock: 0,
        description: "",
        keywords: [],
    });

    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
      const { isAuthenticated, authUser} = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [description, setDescription] = useState("");
    const [keywords, setKeywords] = useState<string[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [priceInput, setPriceInput] = useState<string>("");


    const adminUser = "62xJXdO14EXWMCLS1CpHlI5PPFu1";
    const db = getFirestore();
    const storage = getStorage();

    useEffect(() => {
        if (loggedInUser === adminUser) {
            
            const fetchProducts = async () => {
                try {
                    const querySnapshot = await getDocs(collection(db, "products"));
                    setProducts(
                        querySnapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        })) as Product[]
                    );
                } catch (error) {
                    console.error("Error fetching products:", error);
                }
            };
            const fetchCategories = async () => {
                const querySnapshot = await getDocs(collection(db, "categories"));
                setCategories(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Category[]);
            };
            fetchProducts();
            fetchCategories();
        }
    }, [db, loggedInUser]);

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        setErrorMessage("");
        try {
            const storage1 = getStorage();

            const storageRef = ref(storage1, `products/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            const downloadURL = await new Promise<string>((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    null,
                    (error) => reject(error),
                    async () => {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(url);
                    }
                );
            });
            console.log("WHAAHT IS HAPPENEING");

            setNewProduct({ ...newProduct, imageUrl: downloadURL });
        } catch (error) {
            console.error("Error uploading image:", error);
            setErrorMessage("Image upload failed. Please try again.");
        } finally {
            setUploadingImage(false);
        }
    };

    const addProduct = async () => {
        setErrorMessage("");

        if (!newProduct.name || newProduct.price <= 0 || newProduct.stock < 0 || !newProduct.categoryId) {
            setErrorMessage("Please provide valid product details, including a category.");
            return;
        }


        try {
            await addDoc(collection(db, "products"), newProduct);  // Saves description and keywords
            setNewProduct({
                name: "",
                price: 0,
                weight: 0,
                imageUrl: "",
                categoryId: "",
                stock: 0,
                description: "",  // Reset description
                keywords: [],     // Reset keywords
            });
            const querySnapshot = await getDocs(collection(db, "products"));
            setProducts(
                querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Product[]
            );
        } catch (error) {
            console.error("Error adding product:", error);
            setErrorMessage("Failed to add product. Please try again.");
        }
    };

    const updateProduct = async (id: string, updatedData: Partial<Product>) => {
        try {
            await updateDoc(doc(db, "products", id), updatedData);
            const updatedProducts = products.map((product) =>
                product.id === id ? { ...product, ...updatedData } : product
            );
            setProducts(updatedProducts);
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            await deleteDoc(doc(db, "products", id));
            setProducts(products.filter((product) => product.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    if (loggedInUser !== adminUser) {
        return <p>You do not have access to the Admin Panel.</p>;
    }




    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700">Admin Panel</h1>

            {/* Add Product Section */}
            <div className="mb-10 bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Add Product</h2>
                {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
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
                                    setPriceInput("0.00");  // Default to 0.00 if empty or invalid
                                    setNewProduct({ ...newProduct, price: 0 });
                                }
                                setEditingProductId(null);  // Exit edit mode
                            }}
                            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                    <div>
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
                        <select
                            value={newProduct.categoryId}
                            onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                            className="border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
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
                    <div className="col-span-2">
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
                    <div className="col-span-2">
                        <label className="block font-semibold mb-1 text-gray-600">Keywords (comma-separated)</label>
                        <input
                            type="text"
                            placeholder="Enter keywords, separated by commas"
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
                                                    name: product.name,
                                                    price: product.price,
                                                    stock: product.stock,
                                                    description: product.description,
                                                    keywords: product.keywords,
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
                                            onClick={() => deleteProduct(product.id)}
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