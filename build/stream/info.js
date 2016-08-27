"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("events");

var _smParsers = require("sm-parsers");

var _destroy2 = require("destroy");

var _destroy3 = _interopRequireDefault(_destroy2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StreamInfo = function (_EventEmitter) {
  _inherits(StreamInfo, _EventEmitter);

  function StreamInfo(stream, metadata, item) {
    _classCallCheck(this, StreamInfo);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StreamInfo).call(this));

    _this.stream = stream;
    _this.metadata = metadata;
    _this.item = item;

    _this.isCollected = false;
    _this.isCollecting = false;
    _this.buffer = new Buffer([]);
    _this.parser = new _smParsers.MP3();
    _this.processedBytes = 0;

    _this.stream.once("end", function () {
      _this.isCollected = true;
      _this.isCollecting = false;

      _this.emit("collected", _this);
    });

    _this.parser.once("frame", function (data, firstHeader) {
      _this.setHeader(firstHeader);
    }).on("frame", function (data) {
      _this.appendToBuffer(data);
    });
    return _this;
  }

  _createClass(StreamInfo, [{
    key: "collect",
    value: function collect() {
      this.isCollecting = true;
      this.stream.pipe(this.parser);
    }
  }, {
    key: "setHeader",
    value: function setHeader(firstHeader) {
      this.isHeaderPresent = true;
      this.RTC = new Date();
      this.bytesPerMillisecond = firstHeader.frames_per_sec * firstHeader.frameSizeRaw / 1000;
    }
  }, {
    key: "appendToBuffer",
    value: function appendToBuffer(data) {
      this.buffer = Buffer.concat([this.buffer, data]);
    }
  }, {
    key: "cutBeginOfBuffer",
    value: function cutBeginOfBuffer(length) {
      var removedBuffer = this.buffer.slice(0, length);
      this.buffer = this.buffer.slice(length, this.buffer.length);
      return removedBuffer;
    }
  }, {
    key: "calculateBufferAmountToSend",
    value: function calculateBufferAmountToSend(bufferSize) {
      var millisecondsSinceStart = new Date() - this.RTC;
      var bytesSinceStart = millisecondsSinceStart * this.bytesPerMillisecond;
      var buffersSinceStart = Math.floor(bytesSinceStart / bufferSize);
      var processedBuffers = Math.floor(this.processedBytes / bufferSize);
      return buffersSinceStart - processedBuffers;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      (0, _destroy3.default)(this.stream);
      this.stream.removeAllListeners();
      this.stream = null;

      (0, _destroy3.default)(this.parser);
      this.parser.removeAllListeners();
      this.parser = null;
    }
  }]);

  return StreamInfo;
}(_events.EventEmitter);

exports.default = StreamInfo;