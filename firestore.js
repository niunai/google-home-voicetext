import { ip, device, notify, play } from "./google-home-voicetext.js";
// import dt from "date-utils";
import admin from "firebase-admin";

// import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };
import { readFile } from 'fs/promises';
const serviceAccount = JSON.parse(await readFile('./serviceAccountKey.json'))

import * as dotenv from "dotenv";
dotenv.config();
import { logInfo, logErr } from "./util.js";

const deviceName = process.env["GOOGLE_HOME_NAME"];
device(deviceName);

if (process.env["GOOGLE_HOME_IP"]) {
  ip(process.env["GOOGLE_HOME_IP"]);
}

const isMute = async function () {
  return await fetch(process.env["MUTE_API_SERVER_URL"])
    .then((res) => res.json())
    .then((data) => {
      return JSON.parse(data.mute);
    })
    .catch((err) => {
      logErr("fetch", err);
      return false;
    });
};

const muteSoundUrl = process.env["MUTE_SOUND_URL"];

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Connect to Firestore
const firestore = admin.firestore();
const document = firestore.doc("/googlehome/chant");
const observer = document.onSnapshot(
  async (docSnapshot) => {
    if (await isMute()) {
      try {
        play(deviceName, muteSoundUrl, "mute", function (playRes) {
          logInfo(playRes);
        });
      } catch (err) {
        logErr("play", err);
      }
      return;
    }

    const text = docSnapshot.get("message");
    if (text) {
      // const now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
      // console.log(now);
      try {
        notify(text, function (notifyRes) {
          logInfo(notifyRes);
        });
      } catch (err) {
        logErr("notify", err);
      }
      document
        .update({
          message: "",
        })
        .then(() => {
          logInfo(text);
        });
    }
  },
  (err) => {
    logErr("onSnapshot", err);
    logInfo(document);
  }
);
