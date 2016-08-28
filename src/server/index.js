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
import Client from "./client";
import clientMiddleware from "./client-middleware";
import allowMiddleware from "./client-allow-middleware";

const jscastDescription = "jscast - A SHOUTcast Server/Library written in JavaScript";
const jscastUrl = "https://github.com/BigTeri/jscast";

export default class Server extends EventEmitter {
  constructor(options) {
    super();

    options = options || {};
    this.name = options.name || jscastDescription;
    this.genre = options.genre || "Music";
    this.url = options.url || jscastUrl;
    this.isPublic = options.isPublic || false;
    this.bitrate = options.bitrate || 128;
    this.storageType = options.storageType || null;
    this.bufferSize = options.bufferSize || 8192;
    this.skipMetadata = options.skipMetadata || false;
    this.staticPath = options.staticPath || "./manage";
    this.port = options.port || 8000;
    this.allow = options.allow || function () {
      return true;
    };

    this.station = new Station({
      postProcessingBitRate: this.bitrate,
      storageType: this.storageType,
      bufferSize: this.bufferSize,
      dataInterval: options.dataInterval,
      prebufferSize: options.prebufferSize,
      skipFilePlugin: options.skipFilePlugin,
      skipStreamPlugin: options.skipStreamPlugin,
      skipYouTubePlugin: options.skipYouTubePlugin,
      playlists: options.playlists
    });

    this.station.on("error", (err) => this.emit("error", err));
    this.station.on("play", (item, metadata) => this.emit("play", item, metadata));
    this.station.on("nothingToPlay", (playlist) => this.emit("nothingToPlay", playlist));
    this.station.on("data", (data, metadata) => {
      if (data) {
        let metadataBuffer = data;
        if (!this.skipMetadata) {
          metadataBuffer = metadata.createCombinedBuffer(data);
        }
        this.clients.forEach((client) => {
          const sendMetadata = !this.skipMetadata && client.wantsMetadata;
          if (sendMetadata) {
            client.write(metadataBuffer);
          } else {
            client.write(data);
          }
        });
      }
    });

    this.clients = [];
    this.app = express();
    this.http = new HttpServer(this.app);
    this.webRouter = new express.Router();
    this.app.use((req, res, next) => {
      res.setHeader("x-powered-by", "jscast " + jscastUrl);
      next();
    });
    // TODO: allow for socket.io
    this.app.use(clientMiddleware);
    this.app.use(allowMiddleware(this.allow, (client) => {
      this.emit("clientRejected", client);
    }));
    this.app.get("/", (req, res) => this.clientConnected(new Client(req, res)));
    this.app.use(fixWindowsPath(path.join("/", this.staticPath)), this.webRouter);
    this.webRouter.use(express.static(fixWindowsPath(path.join(__dirname, "../../", this.staticPath))));
    this.io = SocketIOServer(this.http, {
      path: fixWindowsPath(path.join("/", this.staticPath, "/sockets"))
    });

    this.socketClients = [];
    this.io.on("connection", (socket) => {
      this.socketClients.push(socket);

      socket.once("disconnect", () => {
        this.socketClients.splice(this.socketClients.indexOf(socket), 1);
      });

      socket.on("fetch", () => {
        socket.emit("info", {
          item: this.station.item,
          metadata: this.station.metadata,
          playlists: this.station.playlists
        });
      });

      socket.on("next", () => {
        this.station.replaceNext();
      });

      socket.on("addPlaylist", () => {
        this.station.addPlaylist();
      });

      socket.on("playPlaylist", (playlistId) => {
        this.station.replacePlaylistByPlaylistId(playlistId);
      });

      socket.on("addItem", (item) => {
        // TODO: item validation
        this.station.addItem(item);
      });
    });

    this.station.on("play", (item, metadata) => {
      this.socketClients.forEach((socket) => {
        socket.emit("playing", item, metadata);
      });
    });

    this.station.on("playlistCreated", (playlist) => {
      this.socketClients.forEach((socket) => {
        socket.emit("playlistCreated", playlist);
      });
    });

    this.station.on("itemCreated", (item, playlistId) => {
      this.socketClients.forEach((socket) => {
        socket.emit("itemCreated", item, playlistId);
      });
    });
  }

  start(port, done) {
    if (typeof port === "function") {
      done = port;
      port = null;
    }

    this.port = port = port || this.port;

    this.once("start", () => {
      this.station.start();
      done && done(this);
    });

    this.http.listen(this.port, () => {
      this.emit("start");
    });
  }

  clientConnected(client) {
    this.clients.push(client);
    this.emit("clientConnect", client);

    client.res.writeHead(200, this.getHeaders(client));
    client.req.once("close", this.clientDisconnected.bind(this, client));
  }

  clientDisconnected(client) {
    this.emit("clientDisconnect", client);
    this.clients.splice(this.clients.indexOf(client), 1);
  }

  getHeaders(client) {
    const sendMetadata = !this.skipMetadata && client.wantsMetadata;
    return {
      "Content-Type": "audio/mpeg",
      "icy-name": this.name,
      "icy-genre": this.genre,
      "icy-url": this.url,
      "icy-pub": this.isPublic ? "1" : "0",
      "icy-br": this.bitrate.toString(),
      "icy-metaint": sendMetadata ? this.bufferSize.toString() : "0"
    };
  }
}

function fixWindowsPath(url) {
  return url.replace(/\\/g, "/");
}
