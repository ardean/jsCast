"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class JSONType {
  constructor() {}

  activate(options, done) {
    this.folder = options.folder || "./json";
    (0, _mkdirp2.default)(this.folder, done);
  }

  findAll(done) {
    _fs2.default.readdir(this.folder, (err, files) => {
      const playlists = files.map(playlistFile => {
        const filename = _path2.default.join(this.folder, playlistFile);
        const data = _fs2.default.readFileSync(filename).toString();
        return JSON.parse(data);
      });
      done && done(null, playlists);
    });
  }

  insert(playlist, done) {
    const jsonString = JSON.stringify(playlist, null, 2);
    const filename = _path2.default.join(this.folder, playlist._id + ".json");
    _fs2.default.writeFile(filename, jsonString, err => {
      if (err) return done && done(err);
      done && done();
    });
  }

  update(playlist, done) {
    this.insert(playlist, done);
  }

  remove(id, done) {
    const filename = _path2.default.join(this.folder, id + ".json");
    _fs2.default.unlink(filename, err => {
      if (err) return done && done(err);
      done && done();
    });
  }
}
exports.default = JSONType;