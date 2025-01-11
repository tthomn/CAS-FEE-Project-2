// src/services/firebase/firestoreService.ts
import {db, storage} from "./firebaseConfig";
import {collection, getDocs, addDoc, deleteDoc,  query, where, updateDoc, DocumentReference,DocumentData, Timestamp , QueryConstraint, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject  } from "firebase/storage";


//Query for Doc fields (Cart Items) with 1 condition
//Gets the Contens (the fields) 
export async function getDocDataBy1Condition<T>(collectionName: string, field: string,operator: any,value: any): Promise<T[]> {
    try {    
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as T),
    }));
    return data;
    }
    catch (error) {
        console.error(`Error fetching documents from ${collectionName} where ${field} ${operator} ${value}:`, error);
        throw error;   
    }
}

//Query for Doc Refference using 1 condition
export async function getDocRefsBy1Condition(collectionName: string, field1: string,operator1: any,value1: any): Promise<DocumentReference<DocumentData>[]> {
    try {    
    const q = query(collection(db, collectionName), where(field1, operator1, value1));
    const querySnapshot = await getDocs(q);
    const docRefs = querySnapshot.docs.map(doc => doc.ref); 
    return docRefs;    
    }
    catch (error) {
        console.error(`Error fetching documents from ${collectionName} where ${field1} ${operator1} ${value1}`, error);
        throw error;   
    }
}

//Query for Doc Refference using 2 condition
export async function getDocRefsBy2Condition(collectionName: string, field1: string,operator1: any,value1: any,  field2: string,operator2: any,value2: any): Promise<DocumentReference<DocumentData>[]> {
    try {    
    const q = query(collection(db, collectionName), where(field1, operator1, value1), where(field2, operator2, value2));
    const querySnapshot = await getDocs(q);
    const docRefs = querySnapshot.docs.map(doc => doc.ref); 
    return docRefs;    
    }
    catch (error) {
        console.error(`Error fetching documents from ${collectionName} where ${field1} ${operator1} ${value1} and ${field2} ${operator2} ${value2}:`, error);
        throw error;   
    }
}

//Fetches data from a specified Firestore collection with optional query constraints.
export async function getCollectionData<T>( collectionName: string, constraints: QueryConstraint[] = [] ): Promise<T[]> {
    try {
      const colRef = collection(db, collectionName);      
      const q = query(colRef, ...constraints);  
      const querySnapshot = await getDocs(q);
        // Map Firestore docs to objects with `id` + data
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as T),
      }));
    } catch (error) {
      console.error(`Error fetching documents from "${collectionName}"`, error);
      throw error;
    }
  }

/**
 * Add a document to a Firestore collection.
 * @param {string} collectionName - The name of the Firestore collection.
 * @param {Object} payload - The data to be added to the collection.
 * @returns {Promise<string>} - Returns the document ID of the added document.
 */
export async function addDocToCollection<T>(collectionName: string, payload: T): Promise<string> {
    try {
        // Add a timestamp to the payload for consistency if needed
        const enrichedPayload = {
            ...payload,
            addedAt: Timestamp.now(),
        };
        const docRef = await addDoc(collection(db, collectionName), enrichedPayload);
        return docRef.id; 
    } catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
        throw error;
    }
}
//Update Document via Documentrefference
// Updates specific fields in a document. => Requires the document to exist.
export async function updateDocByRef(docRef: DocumentReference<DocumentData>, fieldsToUpdate: Partial<DocumentData>): Promise<void> {
    try {
          await updateDoc(docRef, fieldsToUpdate);
         } catch (error) {
        console.error(`Error updating document:`, error);
        throw error;
    }
}

//Delete Document via Documentrefference
export async function deleteDocByRef(docRef: DocumentReference<DocumentData>): Promise<void> {
    try {
        await deleteDoc(docRef);
    } catch (error) {
        console.error(`Error deleting document:`, error);
        throw error;
    }
}
//_____________________________________________________________Storage_______________________________________________________

//[Upload Image to Firebase Storage]
/**
 * Uploads an image to Firebase Storage.
 * @param {File} file - The image file to upload.
 * @param {string} folderPath - The folder path in Firebase Storage where the image will be saved.
 * @returns {Promise<string>} - Returns the download URL of the uploaded image.
 */
export async function uploadImageToStorage(file: File, folderPath: string): Promise<string> {
    try {
      const storageRef = ref(storage, `${folderPath}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
  
      const downloadURL = await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null, // You can add a progress callback here if needed
          (error) => {
            console.error("Error uploading image:", error);
            reject(error);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });  
      console.log("Image uploaded successfully. URL:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error in uploadImageToStorage function:", error);
      throw error;
    }
  }

//[Delete Image from Firebase Storage wia Image URL]
/**
 * Deletes an item from Firebase Storage using its download URL.
 * @param {string} fileURL - The full download URL of the file.
 * @returns {Promise<void>} - Resolves if deletion is successful.
 */
export async function deleteFileFromStorage(fileURL: string): Promise<void> {
    try {
      // Extract the storage path from the file URL
      const baseUrl = "https://firebasestorage.googleapis.com/v0/b/";
      const bucketName = storage.app.options.storageBucket;
      const prefix = `${baseUrl}${bucketName}/o/`;
  
      if (!fileURL.startsWith(prefix)) {
        throw new Error("Invalid storage URL.");
          }  
      const filePath = decodeURIComponent(fileURL.split("/o/")[1].split("?")[0]);
  
      // Create a reference to the file
      const fileRef = ref(storage, filePath);  
      // Delete the file
      await deleteObject(fileRef);
      console.log(`File deleted successfully from path: ${filePath}`);
    } catch (error) {
      console.error("Error deleting file from storage:", error);
      throw error;
    }
  }




