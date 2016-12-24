"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Item = exports.Playlist = exports.PluginManager = exports.Storage = exports.Station = exports.Stream = exports.JsCast = exports.jscast = undefined;

var _events = require("events");

var _http = require("http");

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _stream = require("./stream");

var _stream2 = _interopRequireDefault(_stream);

var _station = require("./station");

var _station2 = _interopRequireDefault(_station);

var _storage = require("./storage");

var _storage2 = _interopRequireDefault(_storage);

var _plugins = require("./plugins");

var _plugins2 = _interopRequireDefault(_plugins);

var _playlist = require("./playlist");

var _playlist2 = _interopRequireDefault(_playlist);

var _item = require("./item");

var _item2 = _interopRequireDefault(_item);

var _clientMiddleware = require("./client/client-middleware");

var _clientMiddleware2 = _interopRequireDefault(_clientMiddleware);

var _clientAllowMiddleware = require("./client/client-allow-middleware");

var _clientAllowMiddleware2 = _interopRequireDefault(_clientAllowMiddleware);

var _package = require("../package");

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class JsCast extends _events.EventEmitter {
  constructor(options) {
    super();

    options = options || {};

    this.stationOptions = options.stationOptions || {};
    this.station = options.station || new _station2.default(this.stationOptions);

    this.pluginManagerOptions = options.pluginManagerOptions || {};
    this.pluginManager = new _plugins2.default(this.pluginManagerOptions);
  }

  start(options) {
    options = options || {};

    this.app = options.app || (0, _express2.default)();
    this.socket = options.socket || new _http.Server(this.app);
    this.port = options.port || 8000;
    this.allow = options.allow || function () {
      return true;
    };

    this.station = options.station || this.station;
    this.pluginManager = options.pluginManager || this.pluginManager;

    // TODO: universal (client) middlewares
    this.app.use((req, res, next) => {
      res.setHeader("x-powered-by", `jscast v${ _package2.default.version } https://github.com/BigTeri/jscast`);
      next();
    });
    this.app.use(_clientMiddleware2.default);
    this.app.use((0, _clientAllowMiddleware2.default)(this.allow, client => {
      this.emit("clientRejected", client);
    }));

    return this.pluginManager.activate(this).then(options => {
      return new Promise(resolve => {
        if (options.socket && options.port) {
          // TODO: listen to socket
          this.listen(options.socket, options.port, () => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    }).then(() => {
      this.station.start(); // TODO: promises

      return this;
    });
  }

  listen(socket, port, done) {
    if (typeof port === "function") {
      done = port;
      port = null;
    }

    port = this.port = port || this.port;

    this.once("start", () => {
      done && done();
    });

    socket.listen(port, () => {
      this.emit("start");
    });

    return socket;
  }
}

function jscast(options) {
  return new JsCast(options);
}

exports.jscast = jscast;
exports.JsCast = JsCast;
exports.Stream = _stream2.default;
exports.Station = _station2.default;
exports.Storage = _storage2.default;
exports.PluginManager = _plugins2.default;
exports.Playlist = _playlist2.default;
exports.Item = _item2.default;
exports.default = jscast;