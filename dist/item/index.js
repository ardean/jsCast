"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _shortid = require("shortid");

var _shortid2 = _interopRequireDefault(_shortid);

var _file = require("./types/file");

var _file2 = _interopRequireDefault(_file);

var _stream = require("./types/stream");

var _stream2 = _interopRequireDefault(_stream);

var _youtube = require("./types/youtube");

var _youtube2 = _interopRequireDefault(_youtube);

var _destroy = require("destroy");

var _destroy2 = _interopRequireDefault(_destroy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const typePluginMap = {};

class Item {
  constructor(options) {
    this._id = _shortid2.default.generate();
    this.type = options.type;
    this.options = options.options;
    this.typePlugin = Item.getType(this.type);
  }

  load(done) {
    this.typePlugin.getStream(this, (err, stream) => {
      if (err) return done(err);
      stream.once("error", () => {});

      this.typePlugin.getMetadata(this, (err, metadata) => {
        if (err) {
          (0, _destroy2.default)(stream);
          return done(err);
        }

        done(null, stream, metadata, {
          streamNeedsPostProcessing: this.typePlugin.streamNeedsPostProcessing
        });
      });
    });
  }

  toJSON() {
    return {
      _id: this._id,
      type: this.type,
      options: this.options
    };
  }

  static registerType(type, typePlugin) {
    typePluginMap[type] = typePlugin;
  }

  static getType(type) {
    const typePlugin = typePluginMap[type];
    if (!typePlugin) throw new Error("Unknown item type");
    return typePlugin;
  }
}

exports.default = Item;
Item.registerType("File", new _file2.default());
Item.registerType("Stream", new _stream2.default());
Item.registerType("YouTube", new _youtube2.default());