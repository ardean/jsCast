import {
  EventEmitter
} from "events";
import ffmpeg from "fluent-ffmpeg";
import Stream from "../stream";
import Storage from "../storage";
import Playlist from "../playlist";
import Metadata from "./metadata";

export default class Station extends EventEmitter {
  constructor(options) {
    super();

    options = options || {};
    this.playlists = options.playlists || [];
    this.bufferSize = options.bufferSize || null;
    this.dataInterval = options.dataInterval || null;
    this.prebufferSize = options.prebufferSize || null;
    this.postProcessingBitRate = options.postProcessingBitRate || 128;
    this.storageType = options.storageType || "JSON";

    this.storage = new Storage(this.storageType);

    this.itemId = null;
    this.item = null;
    this.metadata = null;

    this.stream = new Stream({
      bufferSize: this.bufferSize,
      dataInterval: this.dataInterval,
      prebufferSize: this.prebufferSize,
      needMoreData: this.streamNeedsMoreData.bind(this)
    });
    this.stream.once("data", () => this.emit("start"));
    this.stream.on("data", (data, metadata, item) => {
      if (this.itemId !== item._id) {
        this.itemId = item._id;
        this.item = item;
        this.metadata = metadata;
        this.emit("play", item, metadata);
      }

      this.emit("data", data, metadata, item);
    });

    this.playlistPlay = this.playlistPlay.bind(this);
    this.playlistReplace = this.playlistReplace.bind(this);

    this.playlists = this.playlists.map((items) => new Playlist({
      items: items
    }));
  }

  start() {
    this.storage.activate({}, (err) => {
      if (err) return console.log(err);
      this.storage.fill(this.playlists, () => {
        this.storage.findAll((err, playlists) => {
          if (err) return console.log(err);
          this.playlists = playlists;

          this.stream.start();
        });
      });
    });
  }

  addPlaylist(playlist) {
    playlist = this.preparePlaylist(playlist);
    this.storage.insert(playlist, (err) => {
      if (err) return console.log(err);

      this.playlists.push(playlist);

      this.emit("playlistCreated", playlist);

      if (!this.playlist) {
        this.handleNoPlaylist();
      }
    });
  }

  addItem(item) {
    const playlist = this.playlist;
    if (playlist) {
      const wasPlaylistEmpty = playlist.items.length < 1;
      item = playlist.addItem(item);

      this.storage.update(playlist, (err) => {
        // TODO: remove item if err
        if (err) return console.log(err);

        this.emit("itemCreated", item, playlist._id);

        if (wasPlaylistEmpty) {
          this.playNext();
        }
      });
    } else {
      // TODO: create playlist with item in it
      console.log("NYI");
    }
  }

  preparePlaylist(playlist) {
    playlist = playlist || [];
    if (Array.isArray(playlist)) {
      return new Playlist(playlist);
    } else {
      return playlist;
    }
  }

  replacePlaylist(playlist) {
    if (this.playlist) {
      this.playlist.removeListener("play", this.playlistPlay);
      this.playlist.removeListener("replace", this.playlistReplace);
    }
    this.playlist = playlist;
    this.playlist.on("play", this.playlistPlay);
    this.playlist.on("replace", this.playlistReplace);
    this.replaceNext();
  }

  replacePlaylistByPlaylistId(playlistId) {
    const playlist = this.findPlaylistById(playlistId);
    if (playlist) this.replacePlaylist(playlist);
  }

  findPlaylistById(id) {
    return this.playlists.find((playlist) => {
      return playlist._id === id;
    });
  }

  playNext() {
    if (this.playlist) {
      this.handleNothingToPlay(!this.playlist.playNext());
    } else {
      this.handleNoPlaylist();
    }
  }

  replaceNext() {
    if (this.playlist) {
      this.handleNothingToPlay(!this.playlist.replaceNext());
    } else {
      this.handleNoPlaylist();
    }
  }

  handleNothingToPlay(isPlaylistEmpty) {
    if (isPlaylistEmpty) {
      this.emit("nothingToPlay", this.playlist);
    }
  }

  handleNoPlaylist() {
    if (this.playlists.length > 0) {
      this.replacePlaylist(this.playlists[0]);
    } else {
      this.emit("nothingToPlay", this.playlist);
    }
  }

  streamNeedsMoreData() {
    this.playNext();
  }

  playlistPlay(err, stream, metadata, item, options) {
    if (err) return this.onPlayError(err);
    options = options || {};

    this.handleStreamError(stream);

    stream = this.handlePostProcessing(stream, options);
    metadata = new Metadata(metadata);
    this.stream.next(stream, metadata, item);
  }

  playlistReplace(err, stream, metadata, item, options) {
    if (err) return this.onPlayError(err);
    options = options || {};

    this.handleStreamError(stream);

    stream = this.handlePostProcessing(stream, options);
    metadata = new Metadata(metadata);
    this.stream.replace(stream, metadata, item);
  }

  onPlayError(err) {
    this.emit("error", err);
    console.log("trying to play next item...");
    this.playNext();
  }

  handleStreamError(stream) {
    return stream.once("error", (err) => {
      stream.destroy();
      this.onPlayError(err);
    });
  }

  handlePostProcessing(stream, options) {
    options = options || {};

    if (options.streamNeedsPostProcessing) {
      stream = ffmpeg(stream).audioBitrate(this.postProcessingBitRate).format("mp3");
    }
    return this.handleStreamError(stream);
  }
}
