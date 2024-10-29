import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';


import serviceAccount from './firebase-adminsdk.json';

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as ServiceAccount),
        databaseURL: "https://beeproductswebshop.firebaseio.com"
    });
}

export default admin;



