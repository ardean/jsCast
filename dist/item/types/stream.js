"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class StreamType {
  constructor() {
    this.streamNeedsPostProcessing = true;
  }

  getStream(item, done) {
    done(null, item.options.stream);
  }

  getMetadata(item, done) {
    done(null, {
      StreamTitle: item.options.title || ""
    });
  }
}
exports.default = StreamType;