"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("events");

var _http = require("http");

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _station = require("../../station");

var _station2 = _interopRequireDefault(_station);

var _client = require("../../client");

var _client2 = _interopRequireDefault(_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class IcyServer extends _events.EventEmitter {
  activate(options) {
    options = options || {};

    this.name = options.name || "jsCast - An Audio Streaming Application written in JavaScript";
    this.url = options.url || "https://github.com/ardean/jsCast";
    this.genre = options.genre || "Music";
    this.isPublic = options.isPublic || false;
    this.bitrate = options.bitrate || 128;
    this.bufferSize = options.bufferSize || 8192;
    this.skipMetadata = options.skipMetadata || false;
    this.rootPath = options.rootPath || "/";

    this.stationOptions = options.stationOptions || {};
    this.station = options.station || new _station2.default(this.stationOptions);
    this.app = options.app || (0, _express2.default)();
    this.socket = options.socket || new _http.Server(this.app);
    this.port = options.port || 8000;

    this.station.on("data", (data, metadata) => {
      if (data) {
        let metadataBuffer = data;

        if (!this.skipMetadata) {
          metadataBuffer = metadata.createCombinedBuffer(data);
        }

        this.clients.forEach(client => {
          const sendMetadata = !this.skipMetadata && client.wantsMetadata;
          client.write(sendMetadata ? metadataBuffer : data);
        });
      }
    });

    this.clients = [];
    this.app.get(this.rootPath, (req, res) => this.clientConnected(new _client2.default(req, res)));
  }

  clientConnected(client) {
    this.clients.push(client);
    this.emit("clientConnect", client);

    client.res.writeHead(200, this.getHeaders(client));
    client.req.once("close", this.clientDisconnected.bind(this, client));
  }

  clientDisconnected(client) {
    this.clients.splice(this.clients.indexOf(client), 1);
    this.emit("clientDisconnect", client);
  }

  getHeaders(client) {
    const sendMetadata = !this.skipMetadata && client.wantsMetadata;
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
}
exports.default = IcyServer;