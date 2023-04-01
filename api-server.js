import express from "express";
import { ip, device, notify, play } from "./google-home-voicetext.js";
// import dt from "date-utils";
import * as dotenv from "dotenv";
dotenv.config();
import { logInfo, logErr } from "./util.js";

const app = express();
const serverPort = 8083;

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
      logErr(err);
      return false;
    });
};

const muteSoundUrl = process.env["MUTE_SOUND_URL"];

app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.post("/play", async function (req, res) {
  // const now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
  // console.log(now);

  if (!req.body) return res.sendStatus(400);
  logInfo(req.body);
  const { deviceName, mp3Url, mp3Title } = req.body;

  if (await isMute()) {
    try {
      play(deviceName, muteSoundUrl, "mute", function (playRes) {
        logInfo(playRes);
        res.send(deviceName + " will play: " + muteSoundUrl + "\n");
      });
    } catch (err) {
      logErr(err);
      res.sendStatus(500);
      res.send(err);
    }
    return;
  }

  if (mp3Url) {
    try {
      play(deviceName, mp3Url, mp3Title, function (playRes) {
        logInfo(playRes);
        res.send(deviceName + " will play: " + mp3Url + "\n");
      });
    } catch (err) {
      logErr(err);
      res.sendStatus(500);
      res.send(err);
    }
  } else {
    res.send('Please POST "deviceName=xxx&mp3Url=http://xxx&mp3Title=xxx"');
  }
});

app.post("/google-home-voicetext", async function (req, res) {
  // const now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
  // console.log(now);

  if (!req.body) return res.sendStatus(400);
  logInfo(req.body);
  const text = req.body.text;

  if (await isMute()) {
    try {
      play(deviceName, muteSoundUrl, "mute", function (playRes) {
        logInfo(playRes);
        res.send(deviceName + " will play: " + muteSoundUrl + "\n");
      });
    } catch (err) {
      logErr(err);
      res.sendStatus(500);
      res.send(err);
    }
    return;
  }

  if (text) {
    try {
      notify(text, function (notifyRes) {
        logInfo(notifyRes);
        res.send(deviceName + " will say: " + text + "\n");
      });
    } catch (err) {
      logErr(err);
      res.sendStatus(500);
      res.send(err);
    }
  } else {
    res.send('Please POST "text=Hello Google Home"');
  }
});

app.listen(serverPort, function () {
  logInfo(`Start api-server. Port is ${serverPort}`);
});
