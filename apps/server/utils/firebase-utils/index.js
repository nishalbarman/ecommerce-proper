const { v4: uuidv4 } = require("uuid");
const { getStorage } = require("firebase-admin/storage");
const admin = require("firebase-admin");

const { decryptToString } = require("./secure-file");

// const serviceAccount = require("./service-account-key.json");
const secureServiceAccountEntry = require("../../service-account.js");

console.log(secureServiceAccountEntry);

const jsonStr = decryptToString(secureServiceAccountEntry);
const serviceAccount = JSON.parse(jsonStr);

// Initialize the app with a service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const storageBucketName = "renting-app-86d7d.appspot.com";

const storage = getStorage();
const bucket = storage.bucket(storageBucketName);
const db = admin.firestore();
const messaging = admin.messaging();

class FirebaseUtils {
  static async uploadImage(buffer, type) {
    const uniqueFileName = uuidv4();
    const fileReference = bucket.file(
      `renting/images/products/${uniqueFileName}`,
    );

    const writeFilePromise = new Promise((resolve, reject) => {
      const blobStream = fileReference.createWriteStream({
        resumable: false,
        contentType: type,
      });

      blobStream.on("error", (error) => {
        reject(error);
      });

      blobStream.on("finish", async () => {
        await fileReference.makePublic();
        const publicUrl = `https://storage.googleapis.com/${storageBucketName}/${fileReference.name}`;
        resolve(publicUrl);
      });

      blobStream.end(buffer);
    });

    return writeFilePromise;
  }

  static async saveFirebaseTokenToDatabase({ firebaseMessagingToken, userId }) {
    await db.collection("users").doc(userId).set(
      {
        token: firebaseMessagingToken,
      },
      { merge: true },
    );
  }

  static async getUserFirebaseTokenFromDatabase({ userId }) {
    const docRef = db.collection("users").doc(userId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data().token;
    } else {
      console.log("No such Firebase Token Available!");
      return null;
    }
  }

  static async getAllTokens() {
    const tokens = [];
    const snapshot = await db.collection("users").get();

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.token) {
        tokens.push(data.token);
      }
    });

    return tokens;
  }

  static async sendNotificationToAllTokens(payload) {
    const tokens = await this.getAllTokens();

    if (tokens.length === 0) {
      console.log("No tokens found.");
      return;
    }

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
    });

    console.log(
      `Successfully sent message: ${response.successCount} notifications sent.`,
    );
    console.log(`${response.failureCount} notifications failed.`);
  }

  static async sendNotificationToUser(payload) {
    const userFirebaseToken = await this.getUserFirebaseTokenFromDatabase({
      userId: payload.userId,
    });

    if (!userFirebaseToken) {
      return console.error("No userId found in firestore database!");
    }

    const response = await messaging.sendEachForMulticast({
      tokens: [userFirebaseToken],
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
    });

    console.log(
      `Successfully sent message: ${response.successCount} notifications sent.`,
    );
    console.log(`${response.failureCount} notifications failed.`);
  }
}

module.exports = {
  FirebaseUtils,
};
