import {
  log
} from "util";
import ip from "ip";
import geoip from "geoip-lite";
import program from "commander";
import pkg from "../package";
import Server from "./server";
import Storage from "./storage";

const storageTypeNames = Storage.getTypeNames();

program
  .version(pkg.version)
  .option("-p, --port [port]", "sets server port", parseInt)
  .option("-s, --storage-type [storageType]", "use storage type, built-in types: " + storageTypeNames.join(", "))
  .option("--ffmpeg-path [ffmpegPath]", "path to ffmpeg binary")
  .option("--youtube-items [youtubeItems]", "youtube items to play", parseList)
  .option("--whitelist [whitelist]", "country whitelist e.g. US,DE", parseList)
  .option("--blacklist [blacklist]", "country blacklist e.g. FR,IT", parseList)
  .parse(process.argv);

const whitelist = program.whitelist;
const blacklist = program.blacklist;

function isInCountryList(geo, list) {
  return geo && list && list.length && list.some((country) => country === geo.country);
}

new Server({
    allow: (client) => {
      // TODO: include in jscast server
      if (ip.isEqual(client.ip, "127.0.0.1") || client.ip === "::1") return true;
      if (
        (!whitelist || !whitelist.length) &&
        (!blacklist || !blacklist.length)
      ) return true;

      const geo = geoip.lookup(client.ip);
      return isInCountryList(geo, whitelist) && !isInCountryList(geo, blacklist);
    },
    stationOptions: {
      storageType: program.storageType,
      ffmpegPath: program.ffmpegPath,
      playlists: [
        (program.youtubeItems || []).map((item) => mapYouTubeList(item))
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
  .listen(program.port, (server) => {
    log(`jscast server is running`);
    log(`listen on http://localhost:${server.port}${server.icyServerRootPath}`);
    log(`manage on http://localhost:${server.port}${server.manageRootPath}`);
  });

function mapYouTubeList(url) {
  return {
    type: "YouTube",
    options: {
      url: url
    }
  };
}

function parseList(data) {
  return (data || "").split(",");
}
