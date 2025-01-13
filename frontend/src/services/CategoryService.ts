import { db } from "./firebase/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export const getCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
};

export const getCategoryById = async (id: string) => {
    const categoryRef = doc(db, "categories", id);
    const docSnap = await getDoc(categoryRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error("Category not found.");
    }
};

