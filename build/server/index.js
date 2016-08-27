"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var _client = require("./client");

var _client2 = _interopRequireDefault(_client);

var _clientMiddleware = require("./client-middleware");

var _clientMiddleware2 = _interopRequireDefault(_clientMiddleware);

var _clientAllowMiddleware = require("./client-allow-middleware");

var _clientAllowMiddleware2 = _interopRequireDefault(_clientAllowMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var jscastDescription = "jscast - A SHOUTcast Server written in JavaScript";
var jscastUrl = "https://github.com/BigTeri/jscast";

var Server = function (_EventEmitter) {
  _inherits(Server, _EventEmitter);

  function Server(options) {
    _classCallCheck(this, Server);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Server).call(this));

    options = options || {};
    _this.name = options.name || jscastDescription;
    _this.genre = options.genre || "Music";
    _this.url = options.url || jscastUrl;
    _this.isPublic = options.isPublic || false;
    _this.bitrate = options.bitrate || 128;
    _this.storageType = options.storageType || null;
    _this.bufferSize = options.bufferSize || 8192;
    _this.skipMetadata = options.skipMetadata || false;
    _this.staticPath = options.staticPath || "./manage";
    _this.port = options.port || 8000;
    _this.allow = options.allow || function () {
      return true;
    };

    _this.station = new _station2.default({
      postProcessingBitRate: _this.bitrate,
      storageType: _this.storageType,
      bufferSize: _this.bufferSize,
      dataInterval: options.dataInterval,
      prebufferSize: options.prebufferSize,
      skipFilePlugin: options.skipFilePlugin,
      skipStreamPlugin: options.skipStreamPlugin,
      skipYouTubePlugin: options.skipYouTubePlugin,
      playlists: options.playlists
    });

    _this.station.on("error", function (err) {
      return _this.emit("error", err);
    });
    _this.station.on("play", function (item, metadata) {
      return _this.emit("play", item, metadata);
    });
    _this.station.on("nothingToPlay", function (playlist) {
      return _this.emit("nothingToPlay", playlist);
    });
    _this.station.on("data", function (data, metadata) {
      if (data) {
        (function () {
          var metadataBuffer = data;
          if (!_this.skipMetadata) {
            metadataBuffer = metadata.createCombinedBuffer(data);
          }
          _this.clients.forEach(function (client) {
            var sendMetadata = !_this.skipMetadata && client.wantsMetadata;
            if (sendMetadata) {
              client.write(metadataBuffer);
            } else {
              client.write(data);
            }
          });
        })();
      }
    });

    _this.clients = [];
    _this.app = (0, _express2.default)();
    _this.http = new _http.Server(_this.app);
    _this.webRouter = new _express2.default.Router();
    _this.app.use(function (req, res, next) {
      res.setHeader("x-powered-by", "jscast " + jscastUrl);
      next();
    });
    // TODO: allow for socket.io
    _this.app.use(_clientMiddleware2.default);
    _this.app.use((0, _clientAllowMiddleware2.default)(_this.allow, function (client) {
      _this.emit("clientRejected", client);
    }));
    _this.app.get("/", function (req, res) {
      return _this.clientConnected(new _client2.default(req, res));
    });
    _this.app.use(_path2.default.join("/", _this.staticPath), _this.webRouter);
    _this.webRouter.use(_express2.default.static(_path2.default.join(__dirname, "../../", _this.staticPath)));
    _this.io = (0, _socket2.default)(_this.http, {
      path: _path2.default.join("/", _this.staticPath, "/sockets")
    });

    _this.socketClients = [];
    _this.io.on("connection", function (socket) {
      _this.socketClients.push(socket);

      socket.once("disconnect", function () {
        _this.socketClients.splice(_this.socketClients.indexOf(socket), 1);
      });

      socket.on("fetch", function () {
        socket.emit("info", {
          item: _this.station.item,
          metadata: _this.station.metadata,
          playlists: _this.station.playlists
        });
      });

      socket.on("next", function () {
        _this.station.replaceNext();
      });

      socket.on("addPlaylist", function () {
        _this.station.addPlaylist();
      });

      socket.on("playPlaylist", function (playlistId) {
        _this.station.replacePlaylistByPlaylistId(playlistId);
      });

      socket.on("addItem", function (item) {
        // TODO: item validation
        _this.station.addItem(item);
      });
    });

    _this.station.on("play", function (item, metadata) {
      _this.socketClients.forEach(function (socket) {
        socket.emit("playing", item, metadata);
      });
    });

    _this.station.on("playlistCreated", function (playlist) {
      _this.socketClients.forEach(function (socket) {
        socket.emit("playlistCreated", playlist);
      });
    });

    _this.station.on("itemCreated", function (item, playlistId) {
      _this.socketClients.forEach(function (socket) {
        socket.emit("itemCreated", item, playlistId);
      });
    });
    return _this;
  }

  _createClass(Server, [{
    key: "start",
    value: function start(port, done) {
      var _this2 = this;

      if (typeof port === "function") {
        done = port;
        port = null;
      }

      this.port = port = port || this.port;

      this.once("start", function () {
        _this2.station.start();
        done && done(_this2);
      });

      this.http.listen(this.port, function () {
        _this2.emit("start");
      });
    }
  }, {
    key: "clientConnected",
    value: function clientConnected(client) {
      this.clients.push(client);
      this.emit("clientConnect", client);

      client.res.writeHead(200, this.getHeaders(client));
      client.req.once("close", this.clientDisconnected.bind(this, client));
    }
  }, {
    key: "clientDisconnected",
    value: function clientDisconnected(client) {
      this.emit("clientDisconnect", client);
      this.clients.splice(this.clients.indexOf(client), 1);
    }
  }, {
    key: "getHeaders",
    value: function getHeaders(client) {
      var sendMetadata = !this.skipMetadata && client.wantsMetadata;
      return {
        "Content-Type": "audio/mpeg",
        "icy-name": this.name,
        "icy-genre": this.genre,
        "icy-url": this.url,
        "icy-pub": this.isPublic ? "1" : "0",
        "icy-br": this.bitrate.toString(),
        "icy-metaint": sendMetadata ? this.bufferSize.toString() : "0"
      };
    }
  }]);

  return Server;
}(_events.EventEmitter);

exports.default = Server;