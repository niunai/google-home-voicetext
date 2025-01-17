import VoiceText from "voicetext";
import path from "path";
import os from "os";
import * as fs from "fs";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import * as dotenv from "dotenv";
dotenv.config();
import { logErr } from "./util.js";

if (!process.env["VOICETEXT_API_KEY"]) {
  throw new Error("VOICETEXT_API_KEY is required.");
}
if (!process.env["WIRELESS_IP"] && !process.env["WIRELESS_MODULE_NAME"]) {
  throw new Error("WIRELESS_IP or WIRELESS_MODULE_NAME is required.");
}
let WIRELESS_IP;
if (process.env["WIRELESS_IP"]) {
  WIRELESS_IP = process.env["WIRELESS_IP"];
} else {
  const ips = os.networkInterfaces();
  const WIRELESS_MODULE_NAME = process.env["WIRELESS_MODULE_NAME"]; // ex. en0
  const WIRELESS_modules = ips[WIRELESS_MODULE_NAME];
  WIRELESS_modules.forEach((module) => {
    if (module.family === "IPv4") {
      WIRELESS_IP = module.address;
    }
  });
}

const FILE_SERVER_PORT = "8082";
const VOICETEXT_API_KEY = process.env["VOICETEXT_API_KEY"];

const voice = new VoiceText(VOICETEXT_API_KEY);
const OUT_PATH = __dirname + "/public/voice/_temp.wav";
const OUTPUT_URL =
  "http://" + WIRELESS_IP + ":" + FILE_SERVER_PORT + "/googlehome/_temp.wav";

const speakers = [
  voice.SPEAKER.SHOW,
  voice.SPEAKER.BEAR,
  voice.SPEAKER.HARUKA,
  voice.SPEAKER.HIKARI,
  voice.SPEAKER.SANTA,
  voice.SPEAKER.TAKERU,
];
export class VoiceTextWriter {
  convertToText(text) {
    return new Promise(function (resolve, reject) {
      voice
        .speaker(speakers[Math.floor(Math.random() * speakers.length)])
        // .emotion(voice.EMOTION.HAPPINESS)
        // .emotion_level(voice.EMOTION_LEVEL.HIGH)
        .volume(150)
        .speed(200)
        .speak(text, function (e, buf) {
          if (e) {
            logErr("voice", e);
            reject(e);
          } else {
            fs.writeFileSync(OUT_PATH, buf, "binary");
            resolve(OUTPUT_URL);
          }
        });
    });
  }
}
