import * as functions from "firebase-functions/v2";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();


export const setAdditionalUserData = functions.https.onCall(async (context) => {
  // Ensure the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can set additional data."
    );
  }
  const {uid, title, name, surname, dob, street, houseNumber, zip, city, country, email} = context.data;

  if (context.auth.uid !== uid) {
    throw new functions.https.HttpsError("permission-denied", "You can only modify your own data.");
  }

  try {
    // Update the Firestore user document
    await db.collection("users").doc(uid).set({
      title,
      name,
      surname,
      dob,
      street,
      houseNumber,
      zip,
      city,
      authType: "user",
      country,
      addedAt: admin.firestore.FieldValue.serverTimestamp(),
      email,
    });

    return {message: "Additional user data set successfully."};
  } catch (error) {
    console.error("Error setting additional user data:", error);
    throw new functions.https.HttpsError("internal", "Failed to set additional user data.");
  }
});

export const setAdmin = functions.https.onCall(async (request) => {
  try {
    const {uid, authType} = request.data;

    if (!uid) {
      throw new Error("User is not authenticated");
    }

    if (authType !== "admin") {
      return {message: `User ${uid} is not allowed to be admin.`};
    } else {
      admin.auth().setCustomUserClaims(uid, {admin: true});

      return {message: `User ${uid} is now an admin.`};
    }
  } catch (error) {
    console.error("Error setting admin role:", error);
    return {message: "Error setting admin role."};
  }
});

