import { log } from "util";
import { default as jsCast, PluginManager } from "../src";
import geoip from "geoip-lite";
import ip from "ip";

const mapYouTubeList = function (url) {
  return {
    type: "YouTube",
    options: {
      url: url
    }
  };
};

const yogscastPlaylist = [
  "https://www.youtube.com/watch?v=99dM8__wphY",
  "https://www.youtube.com/watch?v=gqELqRCnW6g",
  "https://www.youtube.com/watch?v=D67jM8nO7Ag",
  "https://www.youtube.com/watch?v=kzeeV_Dl9gw",
  "https://www.youtube.com/watch?v=PWZylTw6RGY",
  "https://www.youtube.com/watch?v=ytWz0qVvBZ0",
  "https://www.youtube.com/watch?v=qOVLUiha1B8"
].map(mapYouTubeList);

const suicidePlaylist = [
  "https://www.youtube.com/watch?v=7S8t_LfA3y0"
].map(mapYouTubeList);

const jsCastOptions = {
  // webClientRootPath: "/",
  // icyServerRootPath: "/listen",
  stationOptions: {
    // ffmpegPath: "C:/projects/ffmpeg/bin/ffmpeg.exe",
    storageType: "Memory",
    playlists: [
      yogscastPlaylist,
      suicidePlaylist
    ]
  }
};

const instance = jsCast(jsCastOptions)
  .on("clientRejected", (client) => {
    log(`client ${client.ip} rejected`);
  });

const icyServer = instance.pluginManager.getActiveType("IcyServer");
const webClient = instance.pluginManager.getActiveType("WebClient");

instance
  .station
  .on("play", (item, metadata) => {
    log(`playing ${metadata.options.StreamTitle}`);
  })
  .on("nothingToPlay", (playlist) => {
    if (!playlist) {
      log("no playlist");
    } else {
      log("playlist is empty");
    }
  });

instance
  .start({ port: 8000 })
  .then(() => {
    log(`jsCast is running`);

    if (icyServer) {
      icyServer
        .on("clientConnect", (client) => {
          log(`icy client ${client.ip} connected`);
        })
        .on("clientDisconnect", (client) => {
          log(`icy client ${client.ip} disconnected`);
        });

      log(`listen on http://localhost:${icyServer.port}${icyServer.rootPath}`);
    }

    if (webClient) {
      log(`Web Client on http://localhost:${webClient.port}${webClient.rootPath}`);
    }
  })
  .catch((err) => {
    console.error(err);
  });
