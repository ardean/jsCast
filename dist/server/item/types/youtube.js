"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ytdlCore = require("ytdl-core");

var _ytdlCore2 = _interopRequireDefault(_ytdlCore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class YouTubeType {
  constructor() {
    this.streamNeedsPostProcessing = true;
  }

  getStream(item, done) {
    done(null, (0, _ytdlCore2.default)(item.options.url));
  }

  getMetadata(item, done) {
    _ytdlCore2.default.getInfo(item.options.url, (err, info) => {
      if (err) return done(err);
      done(null, {
        StreamTitle: info.author.name + " - " + info.title
      });
    });
  }
}
exports.default = YouTubeType;