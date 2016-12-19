import {
  EventEmitter
} from "events";
import {
  Server as HttpServer
} from "http";
import express from "express";
import Station from "../station";
import IcyServer from "../icy-server";
import Manage from "../manage";
import clientMiddleware from "../client/client-middleware";
import allowMiddleware from "../client/client-allow-middleware";

export default class Server extends EventEmitter {
  constructor(options) {
    super();

    this.icyServerRootPath = options.icyServerRootPath || "/";
    this.manageRootPath = options.manageRootPath || "/manage";
    this.stationOptions = options.stationOptions || {};
    this.station = options.station || new Station(this.stationOptions);
    this.app = options.app || express();
    this.socket = options.socket || new HttpServer(this.app);
    this.port = options.port || 8000;
    this.allow = options.allow || function () {
      return true;
    };

    this.station.on("error", (err) => this.emit("error", err));
    this.station.on("play", (item, metadata) => this.emit("play", item, metadata));
    this.station.on("nothingToPlay", (playlist) => this.emit("nothingToPlay", playlist));

    // TODO: universal (client) middlewares
    this.app.use((req, res, next) => {
      res.setHeader("x-powered-by", "jscast https://github.com/BigTeri/jscast");
      next();
    });
    this.app.use(clientMiddleware);
    this.app.use(allowMiddleware(this.allow, (client) => {
      this.emit("clientRejected", client);
    }));

    this.icyServerOptions = options.icyServerOptions || {};
    this.icyServerOptions.rootPath = this.icyServerOptions.rootPath || this.icyServerRootPath;
    this.icyServerOptions.socket = this.icyServerOptions.socket || this.socket;
    this.icyServerOptions.app = this.icyServerOptions.app || this.app;
    this.icyServerOptions.station = this.icyServerOptions.station || this.station;
    this.icyServer = options.icyServer || new IcyServer(this.icyServerOptions);
    this.icyServer.on("clientConnect", (client) => this.emit("icyServerClientConnect", client));
    this.icyServer.on("clientDisconnect", (client) => this.emit("icyServerClientDisconnect", client));

    this.manageOptions = options.manageOptions || {};
    this.manageOptions.rootPath = this.manageOptions.rootPath || this.manageRootPath;
    this.manageOptions.playerSourcePath = this.manageOptions.playerSourcePath || this.icyServerRootPath;
    this.manageOptions.socket = this.manageOptions.socket || this.socket;
    this.manageOptions.app = this.manageOptions.app || this.app;
    this.manageOptions.station = this.manageOptions.station || this.station;
    this.manage = options.manage || new Manage(this.manageOptions);
    this.manage.on("webSocketClientConnect", (client) => this.emit("manageWebSocketClientConnect", client));
    this.manage.on("webSocketClientDisconnect", (client) => this.emit("manageWebSocketClientDisconnect", client));
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
