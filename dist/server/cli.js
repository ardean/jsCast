"use strict";

var _ip = require("ip");

var _ip2 = _interopRequireDefault(_ip);

var _ = require("./");

var _2 = _interopRequireDefault(_);

var _util = require("util");

var _geoipLite = require("geoip-lite");

var _geoipLite2 = _interopRequireDefault(_geoipLite);

var _storage = require("./storage");

var _storage2 = _interopRequireDefault(_storage);

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _package = require("./package");

var _plugins = require("./plugins");

var _plugins2 = _interopRequireDefault(_plugins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const allStorageTypeNames = _storage2.default.getTypeNames();
const allPluginTypeNames = _plugins2.default.getTypeNames();

_commander2.default.version(_package.version).option("-p, --port [port]", "sets server port", parseInt).option("-s, --storage-type [storageType]", "use storage type, built-in types: " + allStorageTypeNames.join(", ")).option("-t, --plugin-types [pluginTypes]", "use plugin types, built-in types: " + allPluginTypeNames.join(", "), parseList).option("--ffmpeg-path [ffmpegPath]", "path to ffmpeg binary e.g. C:/ffmpeg.exe").option("--youtube-items [youtubeItems]", "youtube items to play e.g. URL1,URL2", parseList).option("--whitelist [whitelist]", "country whitelist e.g. US,DE", parseList).option("--blacklist [blacklist]", "country blacklist e.g. FR,IT", parseList).parse(process.argv);

const whitelist = _commander2.default.whitelist;
const blacklist = _commander2.default.blacklist;
const playlists = [];
const playlist = (_commander2.default.youtubeItems || []).map(item => mapYouTubeList(item));

if (playlist.length) {
  playlists.push(playlist);
}

const jsCastOptions = {
  stationOptions: {
    storageType: _commander2.default.storageType,
    ffmpegPath: _commander2.default.ffmpegPath,
    playlists: playlists
  },
  pluginManagerOptions: {
    types: _commander2.default.pluginTypes
  }
};

const instance = (0, _2.default)(jsCastOptions).on("clientRejected", client => {
  (0, _util.log)(`client ${ client.ip } rejected`);
});

const icyServer = instance.pluginManager.getActiveType("IcyServer");
const webClient = instance.pluginManager.getActiveType("WebClient");

instance.station.on("play", (item, metadata) => {
  (0, _util.log)(`playing ${ metadata.options.StreamTitle }`);
}).on("nothingToPlay", playlist => {
  if (!playlist) {
    (0, _util.log)("no playlist");
  } else {
    (0, _util.log)("playlist is empty");
  }
});

instance.start({
  port: _commander2.default.port,
  allow: client => {
    if (_ip2.default.isEqual(client.ip, "127.0.0.1") || client.ip === "::1") return true;
    if ((!whitelist || !whitelist.length) && (!blacklist || !blacklist.length)) return true;

    const geo = _geoipLite2.default.lookup(client.ip);
    return isInCountryList(geo, whitelist) && !isInCountryList(geo, blacklist);
  }
}).then(() => {
  (0, _util.log)(`jsCast is running`);

  if (icyServer) {
    icyServer.on("clientConnect", client => {
      (0, _util.log)(`icy client ${ client.ip } connected`);
    }).on("clientDisconnect", client => {
      (0, _util.log)(`icy client ${ client.ip } disconnected`);
    });

    (0, _util.log)(`listen on http://localhost:${ icyServer.port }${ icyServer.rootPath }`);
  }

  if (webClient) {
    (0, _util.log)(`Web Client on http://localhost:${ webClient.port }${ webClient.rootPath }`);
  }
}).catch(err => {
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
  return geo && list && list.length && list.some(country => country === geo.country);
}

function parseList(data) {
  return (data || "").split(",");
}