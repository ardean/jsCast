"use strict";

var _util = require("util");

var _ip = require("ip");

var _ip2 = _interopRequireDefault(_ip);

var _geoipLite = require("geoip-lite");

var _geoipLite2 = _interopRequireDefault(_geoipLite);

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _package = require("../package");

var _package2 = _interopRequireDefault(_package);

var _server = require("./server");

var _server2 = _interopRequireDefault(_server);

var _storage = require("./storage");

var _storage2 = _interopRequireDefault(_storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const storageTypeNames = _storage2.default.getTypeNames();

_commander2.default.version(_package2.default.version).option("-p, --port [port]", "sets server port", parseInt).option("-s, --storage-type [storageType]", "use storage type, built-in types: " + storageTypeNames.join(", ")).option("--ffmpeg-path [ffmpegPath]", "path to ffmpeg binary").option("--youtube-items [youtubeItems]", "youtube items to play", parseList).option("--whitelist [whitelist]", "country whitelist e.g. US,DE", parseList).option("--blacklist [blacklist]", "country blacklist e.g. FR,IT", parseList).parse(process.argv);

const whitelist = _commander2.default.whitelist;
const blacklist = _commander2.default.blacklist;

function isInCountryList(geo, list) {
  return geo && list && list.length && list.some(country => country === geo.country);
}

new _server2.default({
  allow: client => {
    // TODO: include in jscast server
    if (_ip2.default.isEqual(client.ip, "127.0.0.1") || client.ip === "::1") return true;
    if ((!whitelist || !whitelist.length) && (!blacklist || !blacklist.length)) return true;

    const geo = _geoipLite2.default.lookup(client.ip);
    return isInCountryList(geo, whitelist) && !isInCountryList(geo, blacklist);
  },
  stationOptions: {
    storageType: _commander2.default.storageType,
    ffmpegPath: _commander2.default.ffmpegPath,
    playlists: [_commander2.default.youtubeItems.map(item => mapYouTubeList(item))]
  }
}).on("error", err => {
  console.error(err);
}).on("nothingToPlay", playlist => {
  if (!playlist) {
    (0, _util.log)("no playlist");
  } else {
    (0, _util.log)("playlist is empty");
  }
}).on("play", (item, metadata) => {
  (0, _util.log)(`playing ${ metadata.options.StreamTitle }`);
}).on("clientRejected", client => {
  (0, _util.log)(`client ${ client.ip } rejected`);
}).on("icyServerClientConnect", client => {
  (0, _util.log)(`client ${ client.ip } connected`);
}).on("icyServerClientDisconnect", client => {
  (0, _util.log)(`client ${ client.ip } disconnected`);
}).listen(_commander2.default.port, server => {
  (0, _util.log)(`jscast server is running`);
  (0, _util.log)(`listen on http://localhost:${ server.port }${ server.icyServerRootPath }`);
  (0, _util.log)(`manage on http://localhost:${ server.port }${ server.manageRootPath }`);
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