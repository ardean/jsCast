"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FileType {
  constructor() {
    this.streamNeedsPostProcessing = true;
  }

  getStream(item, done) {
    done(null, _fs2.default.createReadStream(item.options.filename));
  }

  getMetadata(item, done) {
    done(null, {
      StreamTitle: item.options.title || _path2.default.basename(item.options.filename, _path2.default.extname(item.options.filename))
    });
  }
}
exports.default = FileType;