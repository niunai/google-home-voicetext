import { Client, DefaultMediaReceiver } from "castv2-client";
import { VoiceTextWriter } from "./voice-text-writer.js";
import mdns from "mdns-js";

const browser = mdns.createBrowser(mdns.tcp("googlecast"));
mdns.excludeInterface("0.0.0.0");

let deviceAddress;
let language;

const voiceTextWriter = new VoiceTextWriter();

export let device = function (name, lang = "ja") {
  device = name;
  language = lang;
  return this;
};

export const ip = function (ip) {
  deviceAddress = ip;
  return this;
};

export const notify = function (message, callback) {
  if (!deviceAddress) {
    browser.on("ready", function () {
      console.log("ready");
      browser.discover();
    });

    browser.on("update", function (service) {
      console.log(
        'Device "%s" at %s:%d',
        service.fullname,
        service.addresses[0],
        service.port
      );
      if (
        typeof service.fullname != "undefined" &&
        service.fullname.includes(device.replace(" ", "-"))
      ) {
        console.log(
          'found device "%s" at %s:%d',
          service.fullname,
          service.addresses[0],
          service.port
        );
        deviceAddress = service.addresses[0];
        getSpeechUrl(message, deviceAddress, function (res) {
          callback(res);
        });
        browser.stop();
      }
    });
  } else {
    getSpeechUrl(message, deviceAddress, function (res) {
      callback(res);
    });
  }
};

export const play = function (mp3_url, callback) {
  if (!deviceAddress) {
    browser.on("ready", function () {
      console.log("ready");
      browser.discover();
    });

    browser.on("update", function (service) {
      console.log(
        'Device "%s" at %s:%d',
        service.fullname,
        service.addresses[0],
        service.port
      );
      if (
        typeof service.fullname != "undefined" &&
        service.fullname.includes(device.replace(" ", "-"))
      ) {
        console.log(
          'found device "%s" at %s:%d',
          service.fullname,
          service.addresses[0],
          service.port
        );
        deviceAddress = service.addresses[0];
        getPlayUrl(mp3_url, deviceAddress, function (res) {
          callback(res);
        });
        browser.stop();
      }
    });
  } else {
    getPlayUrl(mp3_url, deviceAddress, function (res) {
      callback(res);
    });
  }
};

const getSpeechUrl = function (text, host, callback) {
  voiceTextWriter
    .convertToText(text)
    .then(function (result, reject) {
      onDeviceUp(host, result, function (res) {
        callback(res);
      });
    })
    .catch(function onRejected(error) {
      console.error(error);
    });
};

const getPlayUrl = function (url, host, callback) {
  onDeviceUp(host, url, function (res) {
    callback(res);
  });
};

const onDeviceUp = function (host, url, callback) {
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
    console.log("Error: %s", err.message);
    client.close();
    callback("error");
  });
};
