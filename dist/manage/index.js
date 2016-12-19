"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("events");

var _http = require("http");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _socket = require("socket.io");

var _socket2 = _interopRequireDefault(_socket);

var _station = require("../station");

var _station2 = _interopRequireDefault(_station);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Manage extends _events.EventEmitter {
  constructor(options) {
    super();

    options = options || {};

    this.app = options.app || (0, _express2.default)();
    this.socket = options.socket || new _http.Server(this.app);
    this.rootPath = options.rootPath || "/manage";
    this.playerSourcePath = options.playerSourcePath || "/";
    this.staticFolderPath = options.staticFolderPath || _path2.default.join(__dirname, "../../", "./manage");
    this.jspmPath = options.jspmPath || _path2.default.join(__dirname, "../../");
    this.jspmPackagesPath = this.jspmPackagesPath || _path2.default.join(this.jspmPath, "./jspm_packages");
    this.jspmConfigPath = this.jspmConfigPath || _path2.default.join(this.jspmPath, "./config.js");
    this.stationOptions = options.stationOptions || {};
    this.station = options.station || new _station2.default(this.stationOptions);

    this.webRouter = new _express2.default.Router();
    this.webRouter.use(_express2.default.static(fixWindowsPath(this.staticFolderPath)));
    this.webRouter.use("/jspm_packages", _express2.default.static(fixWindowsPath(this.jspmPackagesPath)));
    this.app.use(fixWindowsPath(_path2.default.join("/", this.rootPath)), this.webRouter);

    this.jspmRouter = new _express2.default.Router();
    this.jspmRouter.use(_express2.default.static(fixWindowsPath(this.jspmPackagesPath)));
    this.app.use("/jspm_packages", this.jspmRouter);
    this.app.get("/config.js", (req, res) => res.sendFile(fixWindowsPath(this.jspmConfigPath)));

    // TODO: allow for socket.io
    this.webSocketClients = [];
    this.io = (0, _socket2.default)(this.socket, {
      path: fixWindowsPath(_path2.default.join("/", this.rootPath, "/sockets"))
    }).on("connection", socket => {
      this.webSocketClients.push(socket);
      this.emit("webSocketClientConnect", socket);

      socket.once("disconnect", () => {
        this.webSocketClients.splice(this.webSocketClients.indexOf(socket), 1);
        this.emit("webSocketClientDisconnect", socket);
      }).on("fetch", () => {
        socket.emit("info", {
          item: this.station.item,
          metadata: this.station.metadata,
          playlists: this.station.playlists,
          playerSourcePath: this.playerSourcePath
        });
      }).on("next", () => {
        this.station.replaceNext();
      }).on("addItem", item => {
        // TODO: item validation
        this.station.addItem(item);
      }).on("addPlaylist", () => {
        this.station.addPlaylist();
      }).on("playItem", (id, playlistId) => {
        this.station.replacePlaylistByPlaylistIdAndItemId(playlistId, id);
      }).on("playPlaylist", playlistId => {
        this.station.replacePlaylistByPlaylistId(playlistId);
      }).on("removeItem", (id, playlistId) => {
        this.station.removeItem(id, playlistId);
      }).on("removePlaylist", playlistId => {
        this.station.removePlaylist(playlistId);
      });
    });

    this.station.on("play", (item, metadata) => {
      this.webSocketClients.forEach(socket => {
        socket.emit("playing", item, metadata);
      });
    }).on("playlistCreated", playlist => {
      this.webSocketClients.forEach(socket => {
        socket.emit("playlistCreated", playlist);
      });
    }).on("itemCreated", (item, playlist) => {
      this.webSocketClients.forEach(socket => {
        socket.emit("itemCreated", item, playlist._id);
      });
    }).on("itemRemoved", (item, playlist) => {
      this.webSocketClients.forEach(socket => {
        socket.emit("itemRemoved", item._id, playlist._id);
      });
    }).on("playlistRemoved", playlist => {
      this.webSocketClients.forEach(socket => {
        socket.emit("playlistRemoved", playlist._id);
      });
    });
  }
}

exports.default = Manage;
function fixWindowsPath(url) {
  return url.replace(/\\/g, "/");
}