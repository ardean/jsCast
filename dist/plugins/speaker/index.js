"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lame = require("lame");

var _lame2 = _interopRequireDefault(_lame);

var _speaker = require("speaker");

var _speaker2 = _interopRequireDefault(_speaker);

var _station = require("../../station");

var _station2 = _interopRequireDefault(_station);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SpeakerType {
  activate(options) {
    options = options || {};

    this.stationOptions = options.stationOptions || {};
    this.station = options.station || new _station2.default(this.stationOptions);

    this.decoder = options.decoder || new _lame2.default.Decoder();
    this.speaker = options.speaker || new _speaker2.default();

    this.station.on("data", data => {
      if (data && data.length) {
        this.decoder.write(data);
      }
    });

    this.decoder.pipe(this.speaker);
  }
}
exports.default = SpeakerType;