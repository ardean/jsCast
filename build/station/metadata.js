"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var METADATA_BLOCK_SIZE = 16;
var METADATA_LIMIT = METADATA_BLOCK_SIZE * 255;

var Metadata = function () {
  function Metadata(options) {
    _classCallCheck(this, Metadata);

    this.options = options;
    this.text = this.formatText();
    if (this.text.length > METADATA_LIMIT) throw new Error("metadata text length is more than " + METADATA_LIMIT);

    this.chars = Metadata.ensureBlockSize(this.textToBytes());
    this.length = this.chars.length / METADATA_BLOCK_SIZE;
  }

  _createClass(Metadata, [{
    key: "formatText",
    value: function formatText() {
      var _this = this;

      var keys = Object.keys(this.options);
      return keys.map(function (key) {
        return key + "='" + _this.options[key] + "'";
      }).join(",") + ";";
    }
  }, {
    key: "textToBytes",
    value: function textToBytes() {
      return this.text.split("").map(function (x) {
        return x.charCodeAt(0);
      });
    }
  }, {
    key: "createCombinedBuffer",
    value: function createCombinedBuffer(buffer) {
      return Buffer.concat([buffer, new Buffer([this.length]), new Buffer(this.chars)]);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return this.options;
    }
  }], [{
    key: "ensureBlockSize",
    value: function ensureBlockSize(chars) {
      var rest = METADATA_BLOCK_SIZE - chars.length % METADATA_BLOCK_SIZE;
      if (rest < METADATA_BLOCK_SIZE) {
        for (var i = 0; i < rest; i++) {
          chars.push(0);
        }
      }
      return chars;
    }
  }]);

  return Metadata;
}();

exports.default = Metadata;