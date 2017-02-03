import ip from "ip";
import jsCast from "./";
import { log } from "util";
import geoip from "geoip-lite";
import Storage from "./storage";
import program from "commander";
import { version } from "./package";
import PluginManager from "./plugins";

const allStorageTypeNames = Storage.getTypeNames();
const allPluginTypeNames = PluginManager.getTypeNames();

program
  .version(version)
  .option("-p, --port [port]", "sets server port", parseInt)
  .option("-s, --storage-type [storageType]", "use storage type, built-in types: " + allStorageTypeNames.join(", "))
  .option("-t, --plugin-types [pluginTypes]", "use plugin types, built-in types: " + allPluginTypeNames.join(", "), parseList)
  .option("--ffmpeg-path [ffmpegPath]", "path to ffmpeg binary e.g. C:/ffmpeg.exe")
  .option("--youtube-items [youtubeItems]", "youtube items to play e.g. URL1,URL2", parseList)
  .option("--whitelist [whitelist]", "country whitelist e.g. US,DE", parseList)
  .option("--blacklist [blacklist]", "country blacklist e.g. FR,IT", parseList)
  .parse(process.argv);

const whitelist = program.whitelist;
const blacklist = program.blacklist;
const playlists = [];
const playlist = (program.youtubeItems || []).map((item) => mapYouTubeList(item));

if (playlist.length) {
  playlists.push(playlist);
}

const jsCastOptions = {
  stationOptions: {
    storageType: program.storageType,
    ffmpegPath: program.ffmpegPath,
    playlists: playlists
  },
  pluginManagerOptions: {
    types: program.pluginTypes
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
  .start({
    port: program.port,
    allow: (client) => {
      if (ip.isEqual(client.ip, "127.0.0.1") || client.ip === "::1") return true;
      if (
        (!whitelist || !whitelist.length) &&
        (!blacklist || !blacklist.length)
      ) return true;

      const geo = geoip.lookup(client.ip);
      return isInCountryList(geo, whitelist) && !isInCountryList(geo, blacklist);
    }
  })
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

function mapYouTubeList(url) {
  return {
    type: "YouTube",
    options: {
      url: url
    }
  };
}

function isInCountryList(geo, list) {
  return geo && list && list.length && list.some((country) => country === geo.country);
}

function parseList(data) {
  return (data || "").split(",");
}
