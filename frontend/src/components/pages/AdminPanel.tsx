import React, { useState, useEffect } from "react";

import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
} from "firebase/firestore";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "firebase/storage";
import { Product } from "../../types/types";

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
    });
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
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
            fetchProducts();
        }
    }, [db, loggedInUser]);

    const handleImageUpload = async (file: File) => {
        setUploadingImage(true);
        setErrorMessage("");
        try {
            const storageRef = ref(storage, `products/${file.name}`);
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

        if (
            !newProduct.name ||
            newProduct.price <= 0 ||
            newProduct.stock < 0 ||
            !newProduct.imageUrl
        ) {
            setErrorMessage("Please provide valid product details.");
            return;
        }

        try {
            await addDoc(collection(db, "products"), newProduct);
            setNewProduct({
                name: "",
                price: 0,
                weight: 0,
                imageUrl: "",
                categoryId: "",
                stock: 0,
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
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

            {/* Add Product Section */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Add Product</h2>
                {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-semibold mb-1">Product Name</label>
                        <input
                            type="text"
                            placeholder="Enter the product name"
                            value={newProduct.name}
                            onChange={(e) =>
                                setNewProduct({ ...newProduct, name: e.target.value })
                            }
                            className="border p-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Price (USD)</label>
                        <input
                            type="number"
                            placeholder="Enter the price"
                            value={newProduct.price}
                            onChange={(e) =>
                                setNewProduct({
                                    ...newProduct,
                                    price: parseFloat(e.target.value) || 0,
                                })
                            }
                            className="border p-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Stock</label>
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
                            className="border p-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    handleImageUpload(e.target.files[0]);
                                }
                            }}
                            className="border p-2 w-full"
                        />
                        {uploadingImage && <p>Uploading image...</p>}
                    </div>
                </div>
                <button onClick={addProduct} className="bg-blue-500 text-white px-4 py-2 mt-4">
                    Add Product
                </button>
            </div>

            {/* Product List */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Products</h2>
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="grid grid-cols-5 gap-4 items-center border-b py-2"
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
                                                    : p
                                            )
                                        )
                                    }
                                    className="border p-2"
                                />
                                <input
                                    type="number"
                                    value={product.price}
                                    onChange={(e) =>
                                        setProducts((prev) =>
                                            prev.map((p) =>
                                                p.id === product.id
                                                    ? { ...p, price: parseFloat(e.target.value) || 0 }
                                                    : p
                                            )
                                        )
                                    }
                                    className="border p-2"
                                />
                                <input
                                    type="number"
                                    value={product.stock}
                                    onChange={(e) =>
                                        setProducts((prev) =>
                                            prev.map((p) =>
                                                p.id === product.id
                                                    ? { ...p, stock: parseInt(e.target.value) || 0 }
                                                    : p
                                            )
                                        )
                                    }
                                    className="border p-2"
                                />
                                <button
                                    className="bg-green-500 text-white px-4 py-2"
                                    onClick={() => {
                                        updateProduct(product.id, {
                                            name: product.name,
                                            price: product.price,
                                            stock: product.stock,
                                        });
                                        setEditingProductId(null);
                                    }}
                                >
                                    Save
                                </button>
                            </>
                        ) : (
                            <>
                                <span>{product.name}</span>
                                <span>${product.price.toFixed(2)}</span>
                                <span>{product.stock}</span>
                                <button
                                    className="bg-blue-500 text-white px-4 py-2"
                                    onClick={() => setEditingProductId(product.id)}
                                >
                                    Edit
                                </button>
                            </>
                        )}
                        <button
                            className="bg-red-500 text-white px-4 py-2"
                            onClick={() => deleteProduct(product.id)}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPanel;