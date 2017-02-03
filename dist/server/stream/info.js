"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("events");

var _smParsers = require("sm-parsers");

var _destroy = require("destroy");

var _destroy2 = _interopRequireDefault(_destroy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class StreamInfo extends _events.EventEmitter {
  constructor(stream, metadata, item) {
    super();

    this.stream = stream;
    this.metadata = metadata;
    this.item = item;

    this.isCollected = false;
    this.isCollecting = false;
    this.buffer = new Buffer([]);
    this.parser = new _smParsers.MP3();
    this.processedBytes = 0;

    this.stream.once("end", () => {
      this.isCollected = true;
      this.isCollecting = false;

      this.emit("collected", this);
    });

    this.parser.once("frame", (data, firstHeader) => {
      this.setHeader(firstHeader);
    }).on("frame", data => {
      this.appendToBuffer(data);
    });
  }

  collect() {
    this.isCollecting = true;
    this.stream.pipe(this.parser);
  }

  setHeader(firstHeader) {
    this.isHeaderPresent = true;
    this.RTC = new Date();
    this.bytesPerMillisecond = firstHeader.frames_per_sec * firstHeader.frameSizeRaw / 1000;
  }

  appendToBuffer(data) {
    this.buffer = Buffer.concat([this.buffer, data]);
  }

  cutBeginOfBuffer(length) {
    const removedBuffer = this.buffer.slice(0, length);
    this.buffer = this.buffer.slice(length, this.buffer.length);
    return removedBuffer;
  }

  calculateBufferAmountToSend(bufferSize) {
    const millisecondsSinceStart = new Date() - this.RTC;
    const bytesSinceStart = millisecondsSinceStart * this.bytesPerMillisecond;
    const buffersSinceStart = Math.floor(bytesSinceStart / bufferSize);
    const processedBuffers = Math.floor(this.processedBytes / bufferSize);
    return buffersSinceStart - processedBuffers;
  }

  destroy() {
    (0, _destroy2.default)(this.stream);
    this.stream.removeAllListeners();
    this.stream = null;

    (0, _destroy2.default)(this.parser);
    this.parser.removeAllListeners();
    this.parser = null;
  }
}
exports.default = StreamInfo;