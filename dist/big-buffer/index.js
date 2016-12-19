"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("events");

class BigBuffer extends _events.EventEmitter {
  constructor(options) {
    super();

    options = options || {};

    this.minDataLength = options.minDataLength || 1024 * 1;
    this.maxDataLength = options.maxDataLength || 1024 * 1024 * 200;
    this.buffer = new Buffer([]);
  }

  bufferData(buffer) {
    this.buffer = Buffer.concat([this.buffer, buffer]);

    if (this.buffer.length > this.maxDataLength) {
      const bytesToRemove = this.buffer.length - this.maxDataLength;
      console.log("big buffer is full, shifting " + bytesToRemove + " bytes");
      this.buffer = this.buffer.slice(bytesToRemove);
    }
  }

  hasEnoughData() {
    return this.minDataLength <= this.buffer.length;
  }

  getData(length) {
    const buffer = this.buffer.slice(this.buffer.length - length, length);
    this.buffer = this.buffer.slice(0, this.buffer.length - length);

    if (!this.hasEnoughData()) {
      this.emit("needMoreData");
    }

    return buffer;
  }
}
exports.default = BigBuffer;