"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var JSONType = function () {
  function JSONType() {
    _classCallCheck(this, JSONType);
  }

  _createClass(JSONType, [{
    key: "activate",
    value: function activate(options, done) {
      this.folder = options.folder || "./json";
      (0, _mkdirp2.default)(this.folder, done);
    }
  }, {
    key: "findAll",
    value: function findAll(done) {
      var _this = this;

      _fs2.default.readdir(this.folder, function (err, files) {
        var playlists = files.map(function (playlistFile) {
          var filename = _path2.default.join(_this.folder, playlistFile);
          var data = _fs2.default.readFileSync(filename).toString();
          return JSON.parse(data);
        });
        done && done(null, playlists);
      });
    }
  }, {
    key: "insert",
    value: function insert(playlist, done) {
      var jsonString = JSON.stringify(playlist, null, 2);
      var filename = _path2.default.join(this.folder, playlist._id + ".json");
      _fs2.default.writeFile(filename, jsonString, function (err) {
        if (err) return done && done(err);
        done && done();
      });
    }
  }, {
    key: "update",
    value: function update(playlist, done) {
      this.insert(playlist, done);
    }
  }, {
    key: "remove",
    value: function remove(id, done) {
      var filename = _path2.default.join(this.folder, id + ".json");
      _fs2.default.unlink(filename, function (err) {
        if (err) return done && done(err);
        done && done();
      });
    }
  }]);

  return JSONType;
}();

exports.default = JSONType;