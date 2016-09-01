"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("events");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BigBuffer = function (_EventEmitter) {
  _inherits(BigBuffer, _EventEmitter);

  function BigBuffer(options) {
    _classCallCheck(this, BigBuffer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BigBuffer).call(this));

    options = options || {};

    _this.minDataLength = options.minDataLength || 1024 * 1;
    _this.maxDataLength = options.maxDataLength || 1024 * 1024 * 200;
    _this.buffer = new Buffer([]);
    return _this;
  }

  _createClass(BigBuffer, [{
    key: "addData",
    value: function addData(buffer) {
      this.buffer = Buffer.concat([this.buffer, buffer]);

      if (this.buffer.length > this.maxDataLength) {
        var bytesToRemove = this.buffer.length - this.maxDataLength;
        console.log("big buffer is full, shifting " + bytesToRemove + " bytes");
        this.buffer = this.buffer.slice(bytesToRemove);
      }
    }
  }, {
    key: "hasEnoughData",
    value: function hasEnoughData() {
      return this.minDataLength <= this.buffer.length;
    }
  }, {
    key: "getData",
    value: function getData(length) {
      var buffer = this.buffer.slice(this.buffer.length - length, length);
      this.buffer = this.buffer.slice(0, this.buffer.length - length);

      if (!this.hasEnoughData()) {
        this.emit("needMoreData");
      }

      return buffer;
    }
  }]);

  return BigBuffer;
}(_events.EventEmitter);

exports.default = BigBuffer;