import {
  EventEmitter
} from "events";
import {
  Server as HttpServer
} from "http";
import express from "express";
import Station from "../../station";
import Client from "../../client";

export default class IcyServer extends EventEmitter {
  activate(options) {
    options = options || {};

    this.name = options.name || "jscast - A SHOUTcast Server/Library written in JavaScript";
    this.url = options.url || "https://github.com/BigTeri/jscast";
    this.genre = options.genre || "Music";
    this.isPublic = options.isPublic || false;
    this.bitrate = options.bitrate || 128;
    this.bufferSize = options.bufferSize || 8192;
    this.skipMetadata = options.skipMetadata || false;
    this.rootPath = options.rootPath || "/";

    this.stationOptions = options.stationOptions || {};
    this.station = options.station || new Station(this.stationOptions);
    this.app = options.app || express();
    this.socket = options.socket || new HttpServer(this.app);
    this.port = options.port || 8000;

    this.station.on("data", (data, metadata) => {
      if (data) {
        let metadataBuffer = data;

        if (!this.skipMetadata) {
          metadataBuffer = metadata.createCombinedBuffer(data);
        }

        this.clients.forEach((client) => {
          const sendMetadata = !this.skipMetadata && client.wantsMetadata;
          client.write(sendMetadata ? metadataBuffer : data);
        });
      }
    });

    this.clients = [];
    this.app.get(this.rootPath, (req, res) => this.clientConnected(new Client(req, res)));
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
