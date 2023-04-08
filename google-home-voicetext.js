import { Client, DefaultMediaReceiver } from "castv2-client";
import { VoiceTextWriter } from "./voice-text-writer.js";
import mdns from "mdns-js";
import { logInfo, logErr } from "./util.js";

let deviceName;
let deviceAddress;
let language;

const voiceTextWriter = new VoiceTextWriter();

export let device = function (name, lang = "ja") {
  deviceName = name;
  language = lang;
  return this;
};

export const ip = function (ip) {
  deviceAddress = ip;
  return this;
};

export const notify = function (message, callback) {
  const browser = mdns.createBrowser(mdns.tcp("googlecast"));
  mdns.excludeInterface("0.0.0.0");

  if (!deviceAddress) {
    browser.on("ready", function () {
      logInfo("ready");
      browser.discover();
    });

    browser.on("update", function (service) {
      logInfo(
        'Device "%s" at %s:%d',
        service.fullname,
        service.addresses[0],
        service.port
      );
      if (
        typeof service.fullname != "undefined" &&
        service.fullname.includes(deviceName)
      ) {
        logInfo(
          'found device "%s" at %s:%d',
          service.fullname,
          service.addresses[0],
          service.port
        );
        deviceAddress = service.addresses[0];
        getSpeechUrl(deviceAddress, message, function (res) {
          callback(res);
        });
        browser.stop();
      }
    });
  } else {
    getSpeechUrl(deviceAddress, message, function (res) {
      callback(res);
    });
  }
};

export const play = function (deviceName, mp3Url, mp3Title, callback) {
  const browser = mdns.createBrowser(mdns.tcp("googlecast"));
  mdns.excludeInterface("0.0.0.0");

  browser.on("ready", function () {
    logInfo("ready");
    browser.discover();
  });

  browser.on("update", function (service) {
    logInfo(
      'Device "%s" at %s:%d',
      service.fullname,
      service.addresses[0],
      service.port
    );
    if (
      typeof service.fullname != "undefined" &&
      service.fullname.includes(deviceName)
    ) {
      logInfo(
        'found device "%s" at %s:%d',
        service.fullname,
        service.addresses[0],
        service.port
      );
      deviceAddress = service.addresses[0];
      getPlayUrl(deviceAddress, mp3Url, mp3Title, function (res) {
        callback(res);
      });
      browser.stop();
    }
  });
};

const getSpeechUrl = function (host, text, callback) {
  voiceTextWriter
    .convertToText(text)
    .then(function (result, reject) {
      onDeviceUp(host, result, "text", function (res) {
        callback(res);
      });
    })
    .catch(function onRejected(err) {
      logErr("voiceTextWriter", err);
    });
};

const getPlayUrl = function (host, url, mp3Title, callback) {
  onDeviceUp(host, url, mp3Title, function (res) {
    callback(res);
  });
};

const onDeviceUp = function (host, url, mp3Title, callback) {
  const client = new Client();
  client.connect(host, function () {
    client.launch(DefaultMediaReceiver, function (err, player) {
      if (err) {
        callback(err);
        return;
      }
      const media = {
        contentId: url,
        contentType: "audio/mp3",
        streamType: "LIVE", // BUFFERED|LIVE
        title: mp3Title,
      };
      if (url.endsWith("wav")) {
        media.contentType = "audio/wav";
      } else if (url.endsWith("ogg")) {
        media.contentType = "audio/ogg";
      }
      player.load(media, { autoplay: true }, function (err, status) {
        client.close();
        if (err) {
          callback("err: " + err + "\nstatus: " + status);
          return;
        }
        callback("Device notified");
      });
    });
  });

  client.on("error", function (err) {
    logErr("client.on", err);
    client.close();
    callback("error");
  });
};
