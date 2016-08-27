"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileType = function () {
  function FileType() {
    _classCallCheck(this, FileType);

    this.streamNeedsPostProcessing = true;
  }

  _createClass(FileType, [{
    key: "getStream",
    value: function getStream(item, done) {
      done(null, _fs2.default.createReadStream(item.options.filename));
    }
  }, {
    key: "getMetadata",
    value: function getMetadata(item, done) {
      done(null, {
        StreamTitle: item.options.title || _path2.default.basename(item.options.filename, _path2.default.extname(item.options.filename))
      });
    }
  }]);

  return FileType;
}();

exports.default = FileType;