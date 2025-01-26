import * as functions from "firebase-functions/v2";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Deletes all cart items older than 14 days AND with a guestId
export const cartCollectionCleaner = functions.scheduler.onSchedule(
  {
    schedule: "every 336 hours", // 14 days in hours (14 * 24)
    timeZone: "Europe/Zurich",
  },
  async (event) => {
    try {
      const carts = await db.collection("cart")
        .where("guestId", "!=", null)
        .get();

      const batch = db.batch();
      const now = Date.now();
      const cutoff = now - 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

      carts.forEach((doc) => {
        const addedAt = doc.data().addedAt?.toMillis();
        if (addedAt && addedAt < cutoff) {
          batch.delete(doc.ref);
        }
      });

      await batch.commit();
      console.log("CartItem older than 14 days have been deleted successfully.");
    } catch (error) {
      console.error("Error during cart cleanup:", error);
    }
  }
);

export const setAdditionalUserData = functions.https.onCall(async (context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can set additional data.",
    );
  }
  const {
    uid,
    title,
    name,
    surname,
    dob,
    street,
    houseNumber,
    zip,
    city,
    country,
    email,
  } = context.data;

  if (context.auth.uid !== uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "You can only modify your own data.",
    );
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
    throw new functions.https.HttpsError(
      "internal",
      "Failed to set additional user data.",
    );
  }
});

export const setAdmin = functions.https.onCall(async (request) => {
  try {
    const uid = request.auth?.uid;
    let authType = "";

    if (!uid) {
      throw new Error("User is not authenticated");
    }
    await db
      .collection("users")
      .doc(uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          authType = doc.data()?.authType;
        } else {
          authType = "user";
        }
      });

    if (authType !== "admin") {
      return {message: `User ${uid} is not allowed to be admin`};
    } else {
      admin.auth().setCustomUserClaims(uid, {admin: true});

      return {message: `User ${uid} is now an admin.`};
    }
  } catch (error) {
    console.error("Error setting admin role:", error);
    return {message: "Error setting admin role."};
  }
});
