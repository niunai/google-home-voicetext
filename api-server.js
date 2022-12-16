import express from "express";
import { ip, device, notify, play } from "./google-home-voicetext.js";
import dt from "date-utils";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
const serverPort = 8083;

const deviceName = "Google Home";
device(deviceName);

if (process.env["GOOGLE_HOME_IP"]) {
  ip(process.env["GOOGLE_HOME_IP"]);
}

app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.post("/play-mp3", async function (req, res) {
  const now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
  console.log(now);

  const mute = await fetch(process.env["MUTE_API_SERVER_URL"])
    .then((res) => res.json())
    .then((data) => {
      return JSON.parse(data.mute);
    })
    .catch((err) => {
      console.log(err.message);
    });

  if (!req.body) return res.sendStatus(400);
  console.log(req.body);
  const url = req.body.url;
  if (!mute && url) {
    try {
      play(url, function (playRes) {
        console.log(playRes);
        res.send(deviceName + " will play: " + url + "\n");
      });
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
      res.send(err);
    }
  } else {
    res.send('Please POST "url=http://xxx"');
  }
});

app.post("/google-home-voicetext", async function (req, res) {
  const now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
  console.log(now);

  const mute = await fetch(process.env["MUTE_API_SERVER_URL"])
    .then((res) => res.json())
    .then((data) => {
      return JSON.parse(data.mute);
    })
    .catch((err) => {
      console.log(err.message);
    });

  if (!req.body) return res.sendStatus(400);
  console.log(req.body);
  const text = req.body.text;
  if (!mute && text) {
    try {
      notify(text, function (notifyRes) {
        console.log(notifyRes);
        res.send(deviceName + " will say: " + text + "\n");
      });
    } catch (err) {
      console.log(err);
      res.sendStatus(500);
      res.send(err);
    }
  } else {
    res.send('Please POST "text=Hello Google Home"');
  }
});

app.listen(serverPort, function () {
  console.log('POST "text=Hello Google Home" to:');
  console.log(
    "    http://{Server IP address}:" + serverPort + "/google-home-voicetext"
  );
  console.log('POST "url=http://xxx" to:');
  console.log("    http://{Server IP address}:" + serverPort + "/play-mp3");
  console.log("example:");
  console.log(
    'curl -X POST -d "text=こんにちは、Googleです。" http://{Server IP address}:' +
      serverPort +
      "/google-home-voicetext"
  );
  console.log(
    'curl -X POST -d "url=http://xxx" http://{Server IP address}:' +
      serverPort +
      "/play-mp3"
  );
});
