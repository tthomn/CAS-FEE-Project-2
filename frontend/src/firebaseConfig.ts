import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCP9lOYtFmXN4uVAyk11JkkOaBqWO0pklo",
    authDomain: "beeproductswebshop.firebaseapp.com",
    projectId: "beeproductswebshop",
    storageBucket: "beeproductswebshop.appspot.com",
    messagingSenderId: "577491512526",
    appId: "1:577491512526:web:8e5f9b59f57ac222a9749f"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

export { db, auth };