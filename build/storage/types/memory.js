"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MemoryType = function () {
  function MemoryType() {
    _classCallCheck(this, MemoryType);

    this.isFillable = true;
  }

  _createClass(MemoryType, [{
    key: "activate",
    value: function activate(options, done) {
      this.playlistIdMap = {};
      done && done();
    }
  }, {
    key: "fill",
    value: function fill(playlists, done) {
      var _this = this;

      playlists.forEach(function (playlist) {
        return _this.insert(playlist);
      });
      done && done();
    }
  }, {
    key: "findAll",
    value: function findAll(done) {
      var _this2 = this;

      var playlists = Object.keys(this.playlistIdMap).map(function (playlistId) {
        return _this2.playlistIdMap[playlistId];
      });
      done && done(null, playlists);
    }
  }, {
    key: "insert",
    value: function insert(playlist, done) {
      this.playlistIdMap[playlist._id] = playlist;
      done && done();
    }
  }, {
    key: "update",
    value: function update(playlist, done) {
      this.playlistIdMap[playlist._id] = playlist;
      done && done();
    }
  }, {
    key: "remove",
    value: function remove(id, done) {
      delete this.playlistIdMap[id];
      done && done();
    }
  }]);

  return MemoryType;
}();

exports.default = MemoryType;