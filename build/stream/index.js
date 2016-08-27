"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("events");

var _info = require("./info");

var _info2 = _interopRequireDefault(_info);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Stream = function (_EventEmitter) {
  _inherits(Stream, _EventEmitter);

  function Stream(options) {
    _classCallCheck(this, Stream);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Stream).call(this));

    options = options || {};
    _this.bufferSize = options.bufferSize || 8192;
    _this.prebufferSize = options.prebufferSize || _this.bufferSize * 20;
    _this.dataInterval = options.dataInterval || 500;
    _this.needMoreData = options.needMoreData || function () {};
    _this.streamInfos = [];
    return _this;
  }

  _createClass(Stream, [{
    key: "start",
    value: function start() {
      this.dataLoop = this.dataLoop.bind(this);
      this.dataLoop();
    }
  }, {
    key: "dataLoop",
    value: function dataLoop() {
      this.checkNextStream();

      var streamInfo = this.streamInfos[0];
      if (streamInfo && streamInfo.isHeaderPresent) {
        var bufferAmountToSend = streamInfo.calculateBufferAmountToSend(this.bufferSize);
        for (var i = 0; i < bufferAmountToSend; i++) {
          var bufferToSend = this.collectRealtimeBuffer(this.previousBuffer ? this.previousBuffer : new Buffer([]), this.bufferSize);
          if (bufferToSend) {
            if (bufferToSend.length >= this.bufferSize) {
              this.previousBuffer = null;
              this.emit("data", bufferToSend, streamInfo.metadata, streamInfo.item);
            } else {
              this.previousBuffer = bufferToSend;
              console.log("buffer to small");
            }
          } else {
            console.log("no buffer");
          }
        }
      }

      setTimeout(this.dataLoop, this.dataInterval);
    }
  }, {
    key: "collectRealtimeBuffer",
    value: function collectRealtimeBuffer(realtimeBuffer) {
      var streamInfo = this.streamInfos[0];
      if (realtimeBuffer.length >= this.bufferSize) return realtimeBuffer;
      if (!streamInfo) return realtimeBuffer;

      var missingBytes = this.bufferSize - realtimeBuffer.length;
      realtimeBuffer = Buffer.concat([realtimeBuffer, streamInfo.cutBeginOfBuffer(missingBytes)]);

      streamInfo.processedBytes += realtimeBuffer.length;

      if (realtimeBuffer.length < this.bufferSize) {
        var _streamInfo = this.streamInfos.shift();
        _streamInfo.destroy();
        return this.collectRealtimeBuffer(realtimeBuffer);
      }

      return realtimeBuffer;
    }
  }, {
    key: "getRealtimeBufferSize",
    value: function getRealtimeBufferSize() {
      return this.streamInfos.map(function (streamInfo) {
        return streamInfo.buffer.length;
      }).reduce(function (previous, length) {
        return previous + length;
      }, 0);
    }
  }, {
    key: "next",
    value: function next(stream, metadata, item) {
      this.streamInfos.push(new _info2.default(stream, metadata, item));
      this.checkNextStream();
    }
  }, {
    key: "replace",
    value: function replace(stream, metadata, item) {
      this.streamInfos.forEach(function (streamInfo) {
        return streamInfo.destroy();
      });
      this.streamInfos = [new _info2.default(stream, metadata, item)];
      this.didAlreadyRequest = true;
      this.checkNextStream();
    }
  }, {
    key: "checkNextStream",
    value: function checkNextStream() {
      var _this2 = this;

      if (!this.isCollectingData() && this.getRealtimeBufferSize() <= this.prebufferSize) {
        var streamInfo = this.getCollectableStreamInfo();
        if (streamInfo) {
          streamInfo.once("collected", function () {
            _this2.didAlreadyRequest = false;
          });
          streamInfo.collect();
        } else {
          if (!this.didAlreadyRequest) {
            this.didAlreadyRequest = true;
            this.needMoreData();
          }
        }
      }
    }
  }, {
    key: "getCollectableStreamInfo",
    value: function getCollectableStreamInfo() {
      return this.streamInfos.find(function (streamInfo) {
        return !streamInfo.isCollected;
      });
    }
  }, {
    key: "isCollectingData",
    value: function isCollectingData() {
      return this.streamInfos.some(function (streamInfo) {
        return streamInfo.isCollecting;
      });
    }
  }]);

  return Stream;
}(_events.EventEmitter);

exports.default = Stream;