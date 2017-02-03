import { EventEmitter } from "events";
import { Server as HttpServer } from "http";
import express from "express";
import Stream from "./stream";
import Station from "./station";
import Storage from "./storage";
import PluginManager from "./plugins";
import Playlist from "./playlist";
import Item from "./item";
import clientMiddleware from "./client/client-middleware";
import allowMiddleware from "./client/client-allow-middleware";
import { version } from "./package";

class JsCast extends EventEmitter {
  constructor(options) {
    super();

    options = options || {};

    this.stationOptions = options.stationOptions || {};
    this.station = options.station || new Station(this.stationOptions);

    this.pluginManagerOptions = options.pluginManagerOptions || {};
    this.pluginManager = new PluginManager(this.pluginManagerOptions);
  }

  start(options) {
    options = options || {};

    this.app = options.app || express();
    this.socket = options.socket || new HttpServer(this.app);
    this.port = options.port || 8000;
    this.allow = options.allow || function () {
      return true;
    };

    this.station = options.station || this.station;
    this.pluginManager = options.pluginManager || this.pluginManager;

    // TODO: universal (client) middlewares
    this.app.use((req, res, next) => {
      res.setHeader("x-powered-by", `jsCast v${version} https://github.com/ardean/jsCast`);
      next();
    });
    this.app.use(clientMiddleware);
    this.app.use(allowMiddleware(this.allow, (client) => {
      this.emit("clientRejected", client);
    }));

    return this.pluginManager
      .activate(this)
      .then((options) => {
        return new Promise((resolve) => {
          if (options.socket && options.port) {
            // TODO: listen to socket
            this.listen(options.socket, options.port, () => {
              resolve();
            });
          } else {
            resolve();
          }
        });
      })
      .then(() => {
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

function jsCast(options) {
  return new JsCast(options);
}

export {
  jsCast,
  JsCast,
  Stream,
  Station,
  Storage,
  PluginManager,
  Playlist,
  Item
};

export default jsCast;
