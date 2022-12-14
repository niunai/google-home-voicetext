require("dotenv").config();
require("date-utils");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// const firebase = require("firebase");
const googlehome = require("./google-home-voicetext");

const deviceName = "Google Home";
googlehome.device(deviceName);

if (process.env["GOOGLE_HOME_IP"]) {
  googlehome.ip(process.env["GOOGLE_HOME_IP"]);
}

// Initialize Firebase
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
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
      now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
      console.log(now);
      try {
        if (!mute) {
          googlehome.notify(text, function (notifyRes) {
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
