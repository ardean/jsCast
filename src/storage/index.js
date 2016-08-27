import Playlist from "../playlist";
import JSONType from "./types/json";
import MemoryType from "./types/memory";

const typePluginMap = {};

export default class Storage {
  constructor(type) {
    const typePlugin = Storage.getType(type);
    if (!typePlugin) throw new Error("Unknown storage type");
    this.type = type;
    this.typePlugin = typePlugin;
  }

  activate(options, done) {
    this.typePlugin.activate(options, done);
  }

  fill(playlists, done) {
    if (!playlists) return done();
    if (playlists.length <= 0) return done();
    if (!this.typePlugin.isFillable) {
      console.warn("storage type is not fillable");
      return done();
    }

    playlists = mapPlaylists(playlists);
    this.typePlugin.fill(playlists, done);
  }

  findAll(done) {
    this.typePlugin.findAll(mapObjects(done));
  }

  insert(playlist, done) {
    this.typePlugin.insert(playlist, done);
  }

  update(playlist, done) {
    this.typePlugin.update(playlist, done);
  }

  remove(id, done) {
    this.typePlugin.remove(id, done);
  }

  static registerType(type, typePlugin) {
    typePluginMap[type] = typePlugin;
  }

  static getType(type) {
    return typePluginMap[type];
  }

  static getTypeNames() {
    return Object.keys(typePluginMap);
  }
}

Storage.registerType("JSON", new JSONType());
Storage.registerType("Memory", new MemoryType());

function mapObjects(done) {
  return function (err, playlists) {
    if (err) return done(err);
    if (!Array.isArray(playlists)) return done(null, new Playlist(playlists));

    done(null, playlists.map((playlist) => new Playlist(playlist)));
  };
}

function mapPlaylists(playlists) {
  if (!Array.isArray(playlists)) return mapPlaylist(playlists);

  return playlists.map((playlist) => mapPlaylist(playlist));
}

function mapPlaylist(playlist) {
  return playlist.toJSON ? playlist.toJSON() : playlist;
}
