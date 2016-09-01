import {
  EventEmitter
} from "events";
import {
  Server as HttpServer
} from "http";
import path from "path";
import express from "express";
import SocketIOServer from "socket.io";
import Station from "../station";

export default class Manage extends EventEmitter {
  constructor(options) {
    super();

    options = options || {};

    this.app = options.app || express();
    this.socket = options.socket || new HttpServer(this.app);
    this.rootPath = options.rootPath || "/manage";
    this.playerSourcePath = options.playerSourcePath || "/";
    this.staticFolderPath = options.staticFolderPath || path.join(__dirname, "../../", "./manage");
    this.stationOptions = options.stationOptions || {};
    this.station = options.station || new Station(this.stationOptions);

    this.webRouter = new express.Router();
    this.app.use(fixWindowsPath(path.join("/", this.rootPath)), this.webRouter);
    this.webRouter.use(express.static(fixWindowsPath(this.staticFolderPath)));

    // TODO: allow for socket.io
    this.webSocketClients = [];
    this.io = SocketIOServer(this.socket, {
      path: fixWindowsPath(path.join("/", this.rootPath, "/sockets"))
    }).on("connection", (socket) => {
      this.webSocketClients.push(socket);
      this.emit("webSocketClientConnect", socket);

      socket.once("disconnect", () => {
        this.webSocketClients.splice(this.webSocketClients.indexOf(socket), 1);
        this.emit("webSocketClientDisconnect", socket);
      }).on("fetch", () => {
        socket.emit("info", {
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
      this.webSocketClients.forEach((socket) => {
        socket.emit("playing", item, metadata);
      });
    }).on("playlistCreated", (playlist) => {
      this.webSocketClients.forEach((socket) => {
        socket.emit("playlistCreated", playlist);
      });
    }).on("itemCreated", (item, playlist) => {
      this.webSocketClients.forEach((socket) => {
        socket.emit("itemCreated", item, playlist._id);
      });
    }).on("itemRemoved", (item, playlist) => {
      this.webSocketClients.forEach((socket) => {
        socket.emit("itemRemoved", item._id, playlist._id);
      });
    }).on("playlistRemoved", (playlist) => {
      this.webSocketClients.forEach((socket) => {
        socket.emit("playlistRemoved", playlist._id);
      });
    });
  }
}

function fixWindowsPath(url) {
  return url.replace(/\\/g, "/");
}
