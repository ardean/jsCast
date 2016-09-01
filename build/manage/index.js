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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Manage = function (_EventEmitter) {
  _inherits(Manage, _EventEmitter);

  function Manage(options) {
    _classCallCheck(this, Manage);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Manage).call(this));

    options = options || {};

    _this.app = options.app || (0, _express2.default)();
    _this.socket = options.socket || new _http.Server(_this.app);
    _this.rootPath = options.rootPath || "/manage";
    _this.playerSourcePath = options.playerSourcePath || "/";
    _this.staticFolderPath = options.staticFolderPath || _path2.default.join(__dirname, "../../", "./manage");
    _this.stationOptions = options.stationOptions || {};
    _this.station = options.station || new _station2.default(_this.stationOptions);

    _this.webRouter = new _express2.default.Router();
    _this.app.use(fixWindowsPath(_path2.default.join("/", _this.rootPath)), _this.webRouter);
    _this.webRouter.use(_express2.default.static(fixWindowsPath(_this.staticFolderPath)));

    // TODO: allow for socket.io
    _this.webSocketClients = [];
    _this.io = (0, _socket2.default)(_this.socket, {
      path: fixWindowsPath(_path2.default.join("/", _this.rootPath, "/sockets"))
    }).on("connection", function (socket) {
      _this.webSocketClients.push(socket);
      _this.emit("webSocketClientConnect", socket);

      socket.once("disconnect", function () {
        _this.webSocketClients.splice(_this.webSocketClients.indexOf(socket), 1);
        _this.emit("webSocketClientDisconnect", socket);
      }).on("fetch", function () {
        socket.emit("info", {
          item: _this.station.item,
          metadata: _this.station.metadata,
          playlists: _this.station.playlists,
          playerSourcePath: _this.playerSourcePath
        });
      }).on("next", function () {
        _this.station.replaceNext();
      }).on("addItem", function (item) {
        // TODO: item validation
        _this.station.addItem(item);
      }).on("addPlaylist", function () {
        _this.station.addPlaylist();
      }).on("playItem", function (id, playlistId) {
        _this.station.replacePlaylistByPlaylistIdAndItemId(playlistId, id);
      }).on("playPlaylist", function (playlistId) {
        _this.station.replacePlaylistByPlaylistId(playlistId);
      }).on("removeItem", function (id, playlistId) {
        _this.station.removeItem(id, playlistId);
      }).on("removePlaylist", function (playlistId) {
        _this.station.removePlaylist(playlistId);
      });
    });

    _this.station.on("play", function (item, metadata) {
      _this.webSocketClients.forEach(function (socket) {
        socket.emit("playing", item, metadata);
      });
    }).on("playlistCreated", function (playlist) {
      _this.webSocketClients.forEach(function (socket) {
        socket.emit("playlistCreated", playlist);
      });
    }).on("itemCreated", function (item, playlist) {
      _this.webSocketClients.forEach(function (socket) {
        socket.emit("itemCreated", item, playlist._id);
      });
    }).on("itemRemoved", function (item, playlist) {
      _this.webSocketClients.forEach(function (socket) {
        socket.emit("itemRemoved", item._id, playlist._id);
      });
    }).on("playlistRemoved", function (playlist) {
      _this.webSocketClients.forEach(function (socket) {
        socket.emit("playlistRemoved", playlist._id);
      });
    });
    return _this;
  }

  return Manage;
}(_events.EventEmitter);

exports.default = Manage;


function fixWindowsPath(url) {
  return url.replace(/\\/g, "/");
}