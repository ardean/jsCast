import {
  EventEmitter
} from "events";
import {
  Server as HttpServer
} from "http";
import path from "path";
import express from "express";
import SocketIOServer from "socket.io";
import Station from "../../station";

export default class Manage extends EventEmitter {
  activate(options) {
    options = options || {};

    this.app = options.app || express();
    this.socket = options.socket || new HttpServer(this.app);
    this.port = options.port || 8000;
    this.rootPath = options.rootPath || "/manage";
    this.playerSourcePath = options.playerSourcePath || "/";
    this.staticFolderPath = options.staticFolderPath || path.join(__dirname, "../../../", "./manage");
    this.jspmPath = options.jspmPath || path.join(__dirname, "../../../");
    this.jspmPackagesPath = this.jspmPackagesPath || path.join(this.jspmPath, "./jspm_packages");
    this.jspmConfigPath = this.jspmConfigPath || path.join(this.jspmPath, "./config.js");
    this.stationOptions = options.stationOptions || {};
    this.station = options.station || new Station(this.stationOptions);

    this.webRouter = new express.Router();
    this.webRouter.use(express.static(fixWindowsPath(this.staticFolderPath)));
    this.webRouter.use("/jspm_packages", express.static(fixWindowsPath(this.jspmPackagesPath)));
    this.app.use(fixWindowsPath(path.join("/", this.rootPath)), this.webRouter);

    this.jspmRouter = new express.Router();
    this.jspmRouter.use(express.static(fixWindowsPath(this.jspmPackagesPath)));
    this.app.use("/jspm_packages", this.jspmRouter);
    this.app.get("/config.js", (req, res) => res.sendFile(fixWindowsPath(this.jspmConfigPath)));

    this.webSocketClients = [];
    // TODO: allow for socket.io
    this.io = SocketIOServer(this.socket, {
      path: fixWindowsPath(path.join("/", this.rootPath, "/sockets"))
    }).on("connection", (clientSocket) => {
      this.webSocketClients.push(clientSocket);
      this.emit("webSocketClientConnect", clientSocket);

      clientSocket.once("disconnect", () => {
        this.webSocketClients.splice(this.webSocketClients.indexOf(clientSocket), 1);
        this.emit("webSocketClientDisconnect", clientSocket);
      }).on("fetch", () => {
        clientSocket.emit("info", {
          item: this.station.item,
          metadata: this.station.metadata,
          playlists: this.station.playlists,
          playerSourcePath: this.playerSourcePath
        });
      }).on("next", () => {
        this.station.replaceNext();
      }).on("addItem", (item) => {
        // TODO: item validation
        this.station.addItem(item);
      }).on("addPlaylist", () => {
        this.station.addPlaylist();
      }).on("playItem", (id, playlistId) => {
        this.station.replacePlaylistByPlaylistIdAndItemId(playlistId, id);
      }).on("playPlaylist", (playlistId) => {
        this.station.replacePlaylistByPlaylistId(playlistId);
      }).on("removeItem", (id, playlistId) => {
        this.station.removeItem(id, playlistId);
      }).on("removePlaylist", (playlistId) => {
        this.station.removePlaylist(playlistId);
      });
    });

    this.station.on("play", (item, metadata) => {
      this.webSocketClients.forEach((clientSocket) => {
        clientSocket.emit("playing", item, metadata);
      });
    }).on("playlistCreated", (playlist) => {
      this.webSocketClients.forEach((clientSocket) => {
        clientSocket.emit("playlistCreated", playlist);
      });
    }).on("itemCreated", (item, playlist) => {
      this.webSocketClients.forEach((clientSocket) => {
        clientSocket.emit("itemCreated", item, playlist._id);
      });
    }).on("itemRemoved", (item, playlist) => {
      this.webSocketClients.forEach((clientSocket) => {
        clientSocket.emit("itemRemoved", item._id, playlist._id);
      });
    }).on("playlistRemoved", (playlist) => {
      this.webSocketClients.forEach((clientSocket) => {
        clientSocket.emit("playlistRemoved", playlist._id);
      });
    });
  }
}

function fixWindowsPath(url) {
  return url.replace(/\\/g, "/");
}
