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

var _client = require("../client");

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IcyServer = function (_EventEmitter) {
  _inherits(IcyServer, _EventEmitter);

  function IcyServer(options) {
    _classCallCheck(this, IcyServer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(IcyServer).call(this));

    options = options || {};
    _this.name = options.name || "jscast - A SHOUTcast Server/Library written in JavaScript";
    _this.url = options.url || "https://github.com/BigTeri/jscast";
    _this.genre = options.genre || "Music";
    _this.isPublic = options.isPublic || false;
    _this.bitrate = options.bitrate || 128;
    _this.bufferSize = options.bufferSize || 8192;
    _this.skipMetadata = options.skipMetadata || false;
    _this.rootPath = options.rootPath || "/";

    _this.stationOptions = options.stationOptions || {};
    _this.station = options.station || new _station2.default(_this.stationOptions);
    _this.app = options.app || (0, _express2.default)();
    _this.socket = options.socket || new _http.Server(_this.app);

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
    _this.app.get(_this.rootPath, function (req, res) {
      return _this.clientConnected(new _client2.default(req, res));
    });
    return _this;
  }

  _createClass(IcyServer, [{
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
      this.clients.splice(this.clients.indexOf(client), 1);
      this.emit("clientDisconnect", client);
    }
  }, {
    key: "getHeaders",
    value: function getHeaders(client) {
      var sendMetadata = !this.skipMetadata && client.wantsMetadata;
      return {
        "Content-Type": "audio/mpeg",
        "icy-name": this.name,
        "icy-url": this.url,
        "icy-genre": this.genre,
        "icy-pub": this.isPublic ? "1" : "0",
        "icy-br": this.bitrate.toString(),
        "icy-metaint": sendMetadata ? this.bufferSize.toString() : "0"
      };
    }
  }]);

  return IcyServer;
}(_events.EventEmitter);

exports.default = IcyServer;