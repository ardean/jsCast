"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _playlist = require("../playlist");

var _playlist2 = _interopRequireDefault(_playlist);

var _json = require("./types/json");

var _json2 = _interopRequireDefault(_json);

var _memory = require("./types/memory");

var _memory2 = _interopRequireDefault(_memory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var typePluginMap = {};

var Storage = function () {
  function Storage(type) {
    _classCallCheck(this, Storage);

    var typePlugin = Storage.getType(type);
    if (!typePlugin) throw new Error("Unknown storage type");
    this.type = type;
    this.typePlugin = typePlugin;
  }

  _createClass(Storage, [{
    key: "activate",
    value: function activate(options, done) {
      this.typePlugin.activate(options, done);
    }
  }, {
    key: "fill",
    value: function fill(playlists, done) {
      if (!playlists) return done();
      if (playlists.length <= 0) return done();
      if (!this.typePlugin.isFillable) {
        console.warn("storage type is not fillable");
        return done();
      }

      playlists = mapPlaylists(playlists);
      this.typePlugin.fill(playlists, done);
    }
  }, {
    key: "findAll",
    value: function findAll(done) {
      this.typePlugin.findAll(mapObjects(done));
    }
  }, {
    key: "insert",
    value: function insert(playlist, done) {
      this.typePlugin.insert(playlist, done);
    }
  }, {
    key: "update",
    value: function update(playlist, done) {
      this.typePlugin.update(playlist, done);
    }
  }, {
    key: "remove",
    value: function remove(id, done) {
      this.typePlugin.remove(id, done);
    }
  }], [{
    key: "registerType",
    value: function registerType(type, typePlugin) {
      typePluginMap[type] = typePlugin;
    }
  }, {
    key: "getType",
    value: function getType(type) {
      return typePluginMap[type];
    }
  }, {
    key: "getTypeNames",
    value: function getTypeNames() {
      return Object.keys(typePluginMap);
    }
  }]);

  return Storage;
}();

exports.default = Storage;


Storage.registerType("JSON", new _json2.default());
Storage.registerType("Memory", new _memory2.default());

function mapObjects(done) {
  return function (err, playlists) {
    if (err) return done(err);
    if (!Array.isArray(playlists)) return done(null, new _playlist2.default(playlists));

    done(null, playlists.map(function (playlist) {
      return new _playlist2.default(playlist);
    }));
  };
}

function mapPlaylists(playlists) {
  if (!Array.isArray(playlists)) return mapPlaylist(playlists);

  return playlists.map(function (playlist) {
    return mapPlaylist(playlist);
  });
}

function mapPlaylist(playlist) {
  return playlist.toJSON ? playlist.toJSON() : playlist;
}