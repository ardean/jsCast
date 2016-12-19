"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("events");

var _http = require("http");

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _station = require("../station");

var _station2 = _interopRequireDefault(_station);

var _icyServer = require("../icy-server");

var _icyServer2 = _interopRequireDefault(_icyServer);

var _manage = require("../manage");

var _manage2 = _interopRequireDefault(_manage);

var _clientMiddleware = require("../client/client-middleware");

var _clientMiddleware2 = _interopRequireDefault(_clientMiddleware);

var _clientAllowMiddleware = require("../client/client-allow-middleware");

var _clientAllowMiddleware2 = _interopRequireDefault(_clientAllowMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Server extends _events.EventEmitter {
  constructor(options) {
    super();

    this.icyServerRootPath = options.icyServerRootPath || "/";
    this.manageRootPath = options.manageRootPath || "/manage";
    this.stationOptions = options.stationOptions || {};
    this.station = options.station || new _station2.default(this.stationOptions);
    this.app = options.app || (0, _express2.default)();
    this.socket = options.socket || new _http.Server(this.app);
    this.port = options.port || 8000;
    this.allow = options.allow || function () {
      return true;
    };

    this.station.on("error", err => this.emit("error", err));
    this.station.on("play", (item, metadata) => this.emit("play", item, metadata));
    this.station.on("nothingToPlay", playlist => this.emit("nothingToPlay", playlist));

    // TODO: universal (client) middlewares
    this.app.use((req, res, next) => {
      res.setHeader("x-powered-by", "jscast https://github.com/BigTeri/jscast");
      next();
    });
    this.app.use(_clientMiddleware2.default);
    this.app.use((0, _clientAllowMiddleware2.default)(this.allow, client => {
      this.emit("clientRejected", client);
    }));

    this.icyServerOptions = options.icyServerOptions || {};
    this.icyServerOptions.rootPath = this.icyServerOptions.rootPath || this.icyServerRootPath;
    this.icyServerOptions.socket = this.icyServerOptions.socket || this.socket;
    this.icyServerOptions.app = this.icyServerOptions.app || this.app;
    this.icyServerOptions.station = this.icyServerOptions.station || this.station;
    this.icyServer = options.icyServer || new _icyServer2.default(this.icyServerOptions);
    this.icyServer.on("clientConnect", client => this.emit("icyServerClientConnect", client));
    this.icyServer.on("clientDisconnect", client => this.emit("icyServerClientDisconnect", client));

    this.manageOptions = options.manageOptions || {};
    this.manageOptions.rootPath = this.manageOptions.rootPath || this.manageRootPath;
    this.manageOptions.playerSourcePath = this.manageOptions.playerSourcePath || this.icyServerRootPath;
    this.manageOptions.socket = this.manageOptions.socket || this.socket;
    this.manageOptions.app = this.manageOptions.app || this.app;
    this.manageOptions.station = this.manageOptions.station || this.station;
    this.manage = options.manage || new _manage2.default(this.manageOptions);
    this.manage.on("webSocketClientConnect", client => this.emit("manageWebSocketClientConnect", client));
    this.manage.on("webSocketClientDisconnect", client => this.emit("manageWebSocketClientDisconnect", client));
  }

  listen(port, done) {
    if (typeof port === "function") {
      done = port;
      port = null;
    }

    port = this.port = port || this.port;

    this.once("start", () => {
      this.station.start();
      done && done(this);
    });

    this.socket.listen(port, () => {
      this.emit("start");
    });
  }
}
exports.default = Server;