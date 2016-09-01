"use strict";

var _ip = require("ip");

var _ip2 = _interopRequireDefault(_ip);

var _geoipLite = require("geoip-lite");

var _geoipLite2 = _interopRequireDefault(_geoipLite);

var _commander = require("commander");

var _commander2 = _interopRequireDefault(_commander);

var _package = require("../../package");

var _package2 = _interopRequireDefault(_package);

var _ = require("./");

var _2 = _interopRequireDefault(_);

var _storage = require("../storage");

var _storage2 = _interopRequireDefault(_storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storageTypeNames = _storage2.default.getTypeNames();

_commander2.default.version(_package2.default.version).option("-p, --port [port]", "sets server port", parseInt).option("-c, --country [country]", "only allow specific country e.g. US").option("--storageType [storageType]", "use storage type, built-in types: " + storageTypeNames.join(", ")).parse(process.argv);

new _2.default({
  storageType: _commander2.default.storageType,
  allow: function allow(client) {
    if (_ip2.default.isEqual(client.ip, "127.0.0.1") || client.ip === "::1") return true;
    if (_commander2.default.country) {
      var geo = _geoipLite2.default.lookup(client.ip);
      return geo && geo.country === _commander2.default.country;
    } else {
      return true;
    }
  }
}).on("error", function (err) {
  console.log(err);
}).on("nothingToPlay", function (playlist) {
  if (!playlist) {
    console.log("no playlist");
  } else {
    console.log("playlist is empty");
  }
}).on("play", function (item, metadata) {
  console.log("playing " + metadata.options.StreamTitle);
}).on("clientRejected", function (client) {
  console.log("client " + client.ip + " rejected");
}).on("icyServerClientConnect", function (client) {
  console.log("client " + client.ip + " connected");
}).on("icyServerClientDisconnect", function (client) {
  console.log("client " + client.ip + " disconnected");
}).listen(_commander2.default.port, function (server) {
  console.log("jscast server is running");
  console.log("listen on http://localhost:" + server.port + server.icyServerRootPath);
  console.log("manage on http://localhost:" + server.port + server.manageRootPath);
});