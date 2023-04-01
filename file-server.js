import express from "express";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { logInfo } from "./util.js";

const app = express();
const serverPort = 8082;

app.use(express.urlencoded({ extended: false }));

// Allow CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Acquire audio file
app.get("/googlehome/:voiceFileName", (req, res) => {
  const voiceFileName = req.params.voiceFileName;
  if (!voiceFileName) {
    res.status(400).send("Invalid Parameters.");
  }

  const file = fs.readFileSync(
    __dirname + "/public/voice/" + voiceFileName,
    "binary"
  );
  res.setHeader("Content-Length", file.length);
  res.write(file, "binary");
  res.end();
});

app.listen(serverPort, () => {
  logInfo(`Start file-server. Port is ${serverPort}`);
});
