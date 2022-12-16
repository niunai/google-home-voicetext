import { ip, device, notify, play } from "./google-home-voicetext.js";
import dt from "date-utils";
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

const deviceName = "Google Home";
device(deviceName);

if (process.env["GOOGLE_HOME_IP"]) {
  ip(process.env["GOOGLE_HOME_IP"]);
}

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Connect to Firestore
const firestore = admin.firestore();
const document = firestore.doc("/googlehome/chant");
const observer = document.onSnapshot(
  async (docSnapshot) => {
    const mute = await fetch(process.env["MUTE_API_SERVER_URL"])
      .then((res) => res.json())
      .then((data) => {
        return JSON.parse(data.mute);
      })
      .catch((err) => {
        console.log(err.message);
      });

    const text = docSnapshot.get("message");
    if (text) {
      const now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
      console.log(now);
      try {
        if (!mute) {
          notify(text, function (notifyRes) {
            console.log(notifyRes);
          });
        }
      } catch (err) {
        console.log(err);
      }
      document
        .update({
          message: "",
        })
        .then(() => {
          console.log(text);
        });
    }
  },
  (err) => {
    console.log("Firestore error:", err);
    console.log(document);
  }
);
