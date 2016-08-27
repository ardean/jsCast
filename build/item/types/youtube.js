"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ytdlCore = require("ytdl-core");

var _ytdlCore2 = _interopRequireDefault(_ytdlCore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var YouTubeType = function () {
  function YouTubeType() {
    _classCallCheck(this, YouTubeType);

    this.streamNeedsPostProcessing = true;
  }

  _createClass(YouTubeType, [{
    key: "getStream",
    value: function getStream(item, done) {
      done(null, (0, _ytdlCore2.default)(item.options.url));
    }
  }, {
    key: "getMetadata",
    value: function getMetadata(item, done) {
      _ytdlCore2.default.getInfo(item.options.url, function (err, info) {
        if (err) return done(err);
        done(null, {
          StreamTitle: info.author + " - " + info.title
        });
      });
    }
  }]);

  return YouTubeType;
}();

exports.default = YouTubeType;