import {
  log
} from "util";
import Server from "../src";
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

new Server({
    manageRootPath: "/",
    icyServerRootPath: "/listen",
    stationOptions: {
      ffmpegPath: "C:/projects/ffmpeg/bin/ffmpeg.exe",
      storageType: "Memory",
      playlists: [
        yogscastPlaylist,
        suicidePlaylist
      ]
    }
  })
  .on("error", (err) => {
    console.error(err);
  })
  .on("nothingToPlay", (playlist) => {
    if (!playlist) {
      log("no playlist");
    } else {
      log("playlist is empty");
    }
  })
  .on("play", (item, metadata) => {
    log(`playing ${metadata.options.StreamTitle}`);
  })
  .on("clientRejected", (client) => {
    log(`client ${client.ip} rejected`);
  })
  .on("icyServerClientConnect", (client) => {
    log(`client ${client.ip} connected`);
  })
  .on("icyServerClientDisconnect", (client) => {
    log(`client ${client.ip} disconnected`);
  })
  .listen(8888, (server) => {
    log(`jscast server is running`);
    log(`listen on http://localhost:${server.port}${server.icyServerRootPath}`);
    log(`manage on http://localhost:${server.port}${server.manageRootPath}`);
  });
