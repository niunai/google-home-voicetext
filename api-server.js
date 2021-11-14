require("date-utils");
const express = require("express");
const googlehome = require("./google-home-voicetext");
const bodyParser = require("body-parser");
const app = express();
const serverPort = 8083;

const deviceName = "Google Home";
googlehome.device(deviceName);

if (process.env["GOOGLE_HOME_IP"]) {
  googlehome.ip(process.env["GOOGLE_HOME_IP"]);
}

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.post("/play-mp3", urlencodedParser,function(req, res) {
  now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
  console.log(now);
  if (!req.body) return res.sendStatus(400);
  console.log(req.body);
  const url = req.body.url;
  if (url) {
    try {
      googlehome.play(url, function(playRes) {
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

app.post("/google-home-voicetext", urlencodedParser, function(req, res) {
  now = new Date().toFormat("YYYY-MM-DD HH24:MI:SS");
  console.log(now);
  if (!req.body) return res.sendStatus(400);
  console.log(req.body);
  const text = req.body.text;
  if (text) {
    try {
      googlehome.notify(text, function(notifyRes) {
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

app.listen(serverPort, function() {
  console.log('POST "text=Hello Google Home" to:');
  console.log(
    "    http://{Server IP address}:" + serverPort + "/google-home-voicetext"
  );
  console.log('POST "url=http://xxx" to:');
  console.log(
    "    http://{Server IP address}:" + serverPort + "/play-mp3"
  );
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
