"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Server = function (_EventEmitter) {
  _inherits(Server, _EventEmitter);

  function Server(options) {
    _classCallCheck(this, Server);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Server).call(this));

    _this.icyServerRootPath = options.icyServerRootPath || "/";
    _this.manageRootPath = options.manageRootPath || "/manage";
    _this.stationOptions = options.stationOptions || {};
    _this.station = options.station || new _station2.default(_this.stationOptions);
    _this.app = options.app || (0, _express2.default)();
    _this.socket = options.socket || new _http.Server(_this.app);
    _this.port = options.port || 8000;
    _this.allow = options.allow || function () {
      return true;
    };

    _this.station.on("error", function (err) {
      return _this.emit("error", err);
    });
    _this.station.on("play", function (item, metadata) {
      return _this.emit("play", item, metadata);
    });
    _this.station.on("nothingToPlay", function (playlist) {
      return _this.emit("nothingToPlay", playlist);
    });

    // TODO: universal (client) middlewares
    _this.app.use(function (req, res, next) {
      res.setHeader("x-powered-by", "jscast https://github.com/BigTeri/jscast");
      next();
    });
    _this.app.use(_clientMiddleware2.default);
    _this.app.use((0, _clientAllowMiddleware2.default)(_this.allow, function (client) {
      _this.emit("clientRejected", client);
    }));

    _this.icyServerOptions = options.icyServerOptions || {};
    _this.icyServerOptions.rootPath = _this.icyServerOptions.rootPath || _this.icyServerRootPath;
    _this.icyServerOptions.socket = _this.icyServerOptions.socket || _this.socket;
    _this.icyServerOptions.app = _this.icyServerOptions.app || _this.app;
    _this.icyServerOptions.station = _this.icyServerOptions.station || _this.station;
    _this.icyServer = options.icyServer || new _icyServer2.default(_this.icyServerOptions);
    _this.icyServer.on("clientConnect", function (client) {
      return _this.emit("icyServerClientConnect", client);
    });
    _this.icyServer.on("clientDisconnect", function (client) {
      return _this.emit("icyServerClientDisconnect", client);
    });

    _this.manageOptions = options.manageOptions || {};
    _this.manageOptions.rootPath = _this.manageOptions.rootPath || _this.manageRootPath;
    _this.manageOptions.playerSourcePath = _this.manageOptions.playerSourcePath || _this.icyServerRootPath;
    _this.manageOptions.socket = _this.manageOptions.socket || _this.socket;
    _this.manageOptions.app = _this.manageOptions.app || _this.app;
    _this.manageOptions.station = _this.manageOptions.station || _this.station;
    _this.manage = options.manage || new _manage2.default(_this.manageOptions);
    _this.manage.on("webSocketClientConnect", function (client) {
      return _this.emit("manageWebSocketClientConnect", client);
    });
    _this.manage.on("webSocketClientDisconnect", function (client) {
      return _this.emit("manageWebSocketClientDisconnect", client);
    });
    return _this;
  }

  _createClass(Server, [{
    key: "listen",
    value: function listen(port, done) {
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

      this.socket.listen(this.port, function () {
        _this2.emit("start");
      });
    }
  }]);

  return Server;
}(_events.EventEmitter);

exports.default = Server;