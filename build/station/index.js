"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("events");

var _fluentFfmpeg = require("fluent-ffmpeg");

var _fluentFfmpeg2 = _interopRequireDefault(_fluentFfmpeg);

var _stream = require("../stream");

var _stream2 = _interopRequireDefault(_stream);

var _storage = require("../storage");

var _storage2 = _interopRequireDefault(_storage);

var _playlist = require("../playlist");

var _playlist2 = _interopRequireDefault(_playlist);

var _metadata = require("./metadata");

var _metadata2 = _interopRequireDefault(_metadata);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Station = function (_EventEmitter) {
  _inherits(Station, _EventEmitter);

  function Station(options) {
    _classCallCheck(this, Station);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Station).call(this));

    options = options || {};
    _this.playlists = options.playlists || [];
    _this.bufferSize = options.bufferSize || null;
    _this.dataInterval = options.dataInterval || null;
    _this.prebufferSize = options.prebufferSize || null;
    _this.postProcessingBitRate = options.postProcessingBitRate || 128;
    _this.storageType = options.storageType || "JSON";

    _this.storage = new _storage2.default(_this.storageType);

    _this.itemId = null;
    _this.item = null;
    _this.metadata = null;

    _this.stream = new _stream2.default({
      bufferSize: _this.bufferSize,
      dataInterval: _this.dataInterval,
      prebufferSize: _this.prebufferSize,
      needMoreData: _this.streamNeedsMoreData.bind(_this)
    });
    _this.stream.once("data", function () {
      return _this.emit("start");
    });
    _this.stream.on("data", function (data, metadata, item) {
      if (_this.itemId !== item._id) {
        _this.itemId = item._id;
        _this.item = item;
        _this.metadata = metadata;
        _this.emit("play", item, metadata);
      }

      _this.emit("data", data, metadata, item);
    });

    _this.playlistPlay = _this.playlistPlay.bind(_this);
    _this.playlistReplace = _this.playlistReplace.bind(_this);

    _this.playlists = _this.playlists.map(function (items) {
      return new _playlist2.default({
        items: items
      });
    });
    return _this;
  }

  _createClass(Station, [{
    key: "start",
    value: function start() {
      var _this2 = this;

      this.storage.activate({}, function (err) {
        if (err) return console.log(err);
        _this2.storage.fill(_this2.playlists, function () {
          _this2.storage.findAll(function (err, playlists) {
            if (err) return console.log(err);
            _this2.playlists = playlists;

            _this2.stream.start();
          });
        });
      });
    }
  }, {
    key: "addPlaylist",
    value: function addPlaylist(playlist) {
      var _this3 = this;

      playlist = this.preparePlaylist(playlist);
      this.storage.insert(playlist, function (err) {
        if (err) return console.log(err);

        _this3.playlists.push(playlist);

        _this3.emit("playlistCreated", playlist);

        if (!_this3.playlist) {
          _this3.handleNoPlaylist();
        }
      });
    }
  }, {
    key: "addItem",
    value: function addItem(item) {
      var _this4 = this;

      var playlist = this.playlist;
      if (playlist) {
        (function () {
          var wasPlaylistEmpty = playlist.items.length < 1;
          item = playlist.addItem(item);

          _this4.storage.update(playlist, function (err) {
            // TODO: remove item if err
            if (err) return console.log(err);

            _this4.emit("itemCreated", item, playlist._id);

            if (wasPlaylistEmpty) {
              _this4.playNext();
            }
          });
        })();
      } else {
        // TODO: create playlist with item in it
        console.log("NYI");
      }
    }
  }, {
    key: "preparePlaylist",
    value: function preparePlaylist(playlist) {
      playlist = playlist || [];
      if (Array.isArray(playlist)) {
        return new _playlist2.default(playlist);
      } else {
        return playlist;
      }
    }
  }, {
    key: "replacePlaylist",
    value: function replacePlaylist(playlist) {
      if (this.playlist) {
        this.playlist.removeListener("play", this.playlistPlay);
        this.playlist.removeListener("replace", this.playlistReplace);
      }
      this.playlist = playlist;
      this.playlist.on("play", this.playlistPlay);
      this.playlist.on("replace", this.playlistReplace);
      this.replaceNext();
    }
  }, {
    key: "replacePlaylistByPlaylistId",
    value: function replacePlaylistByPlaylistId(playlistId) {
      var playlist = this.findPlaylistById(playlistId);
      if (playlist) this.replacePlaylist(playlist);
    }
  }, {
    key: "findPlaylistById",
    value: function findPlaylistById(id) {
      return this.playlists.find(function (playlist) {
        return playlist._id === id;
      });
    }
  }, {
    key: "playNext",
    value: function playNext() {
      if (this.playlist) {
        this.handleNothingToPlay(!this.playlist.playNext());
      } else {
        this.handleNoPlaylist();
      }
    }
  }, {
    key: "replaceNext",
    value: function replaceNext() {
      if (this.playlist) {
        this.handleNothingToPlay(!this.playlist.replaceNext());
      } else {
        this.handleNoPlaylist();
      }
    }
  }, {
    key: "handleNothingToPlay",
    value: function handleNothingToPlay(isPlaylistEmpty) {
      if (isPlaylistEmpty) {
        this.emit("nothingToPlay", this.playlist);
      }
    }
  }, {
    key: "handleNoPlaylist",
    value: function handleNoPlaylist() {
      if (this.playlists.length > 0) {
        this.replacePlaylist(this.playlists[0]);
      } else {
        this.emit("nothingToPlay", this.playlist);
      }
    }
  }, {
    key: "streamNeedsMoreData",
    value: function streamNeedsMoreData() {
      this.playNext();
    }
  }, {
    key: "playlistPlay",
    value: function playlistPlay(err, stream, metadata, item, options) {
      if (err) return this.onPlayError(err);
      options = options || {};

      this.handleStreamError(stream);

      stream = this.handlePostProcessing(stream, options);
      metadata = new _metadata2.default(metadata);
      this.stream.next(stream, metadata, item);
    }
  }, {
    key: "playlistReplace",
    value: function playlistReplace(err, stream, metadata, item, options) {
      if (err) return this.onPlayError(err);
      options = options || {};

      this.handleStreamError(stream);

      stream = this.handlePostProcessing(stream, options);
      metadata = new _metadata2.default(metadata);
      this.stream.replace(stream, metadata, item);
    }
  }, {
    key: "onPlayError",
    value: function onPlayError(err) {
      this.emit("error", err);
      console.log("trying to play next item...");
      this.playNext();
    }
  }, {
    key: "handleStreamError",
    value: function handleStreamError(stream) {
      var _this5 = this;

      return stream.once("error", function (err) {
        stream.destroy();
        _this5.onPlayError(err);
      });
    }
  }, {
    key: "handlePostProcessing",
    value: function handlePostProcessing(stream, options) {
      options = options || {};

      if (options.streamNeedsPostProcessing) {
        stream = (0, _fluentFfmpeg2.default)(stream).audioBitrate(this.postProcessingBitRate).format("mp3");
      }
      return this.handleStreamError(stream);
    }
  }]);

  return Station;
}(_events.EventEmitter);

exports.default = Station;