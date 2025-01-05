// src/services/firebase/firestoreService.ts
import {db} from "./firebaseConfig";
import {DocumentData, Timestamp } from "firebase/firestore";
import {collection, getDocs, addDoc, deleteDoc,  query, where, updateDoc, DocumentReference  } from 'firebase/firestore';


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




/*

//Add Document 
export async function addDocToCollection<T>(collectionName: string, data: T): Promise<void> {
    try {
        await addDoc(collection(db, collectionName), data);
    } 
    catch (error) {
        console.error(`Error adding document to ${collectionName}:`, error);
        throw error;
    }
}*/


//Delete Document








//QUERIES //TODO: Check if "Document allready exists? => this funcion is called before any of the CURD

//Check if Doc Exists
export async function checkIfDocExists(collectionName: string, field: string, operator: any, value: any) 
{
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => doc.data());
    return data;
}


//TODO: Query for Doc with 2 conditions


//CARD ITEMS [CRUD]






//ORDERS per Accounts 






//FETCH Categories for shop 
//TODO: Dynamic fetch of Categories on shop Page! 






//Products SHOP [Admin Panel]





