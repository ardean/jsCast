"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
const METADATA_BLOCK_SIZE = 16;
const METADATA_LIMIT = METADATA_BLOCK_SIZE * 255;

class Metadata {
  constructor(options) {
    this.options = options;
    this.text = this.formatText();
    if (this.text.length > METADATA_LIMIT) throw new Error("metadata text length is more than " + METADATA_LIMIT);

    this.chars = Metadata.ensureBlockSize(this.textToBytes());
    this.length = this.chars.length / METADATA_BLOCK_SIZE;
  }

  formatText() {
    const keys = Object.keys(this.options);
    return keys.map(key => {
      return key + "='" + this.options[key] + "'";
    }).join(",") + ";";
  }

  textToBytes() {
    return this.text.split("").map(function (x) {
      return x.charCodeAt(0);
    });
  }

  createCombinedBuffer(buffer) {
    return Buffer.concat([buffer, new Buffer([this.length]), new Buffer(this.chars)]);
  }

  toJSON() {
    return this.options;
  }

  static ensureBlockSize(chars) {
    const rest = METADATA_BLOCK_SIZE - chars.length % METADATA_BLOCK_SIZE;
    if (rest < METADATA_BLOCK_SIZE) {
      for (let i = 0; i < rest; i++) {
        chars.push(0);
      }
    }
    return chars;
  }
}
exports.default = Metadata;