"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shortid = require("shortid");

var _shortid2 = _interopRequireDefault(_shortid);

var _file = require("./types/file");

var _file2 = _interopRequireDefault(_file);

var _stream = require("./types/stream");

var _stream2 = _interopRequireDefault(_stream);

var _youtube = require("./types/youtube");

var _youtube2 = _interopRequireDefault(_youtube);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var typePluginMap = {};

var Item = function () {
  function Item(options) {
    _classCallCheck(this, Item);

    this._id = _shortid2.default.generate();
    this.type = options.type;
    this.options = options.options;
    this.typePlugin = Item.getType(this.type);
  }

  _createClass(Item, [{
    key: "load",
    value: function load(done) {
      var _this = this;

      this.typePlugin.getStream(this, function (err, stream) {
        if (err) return done(err);
        stream.once("error", function () {});

        _this.typePlugin.getMetadata(_this, function (err, metadata) {
          if (err) {
            stream.destroy();
            return done(err);
          }

          done(null, stream, metadata, {
            streamNeedsPostProcessing: _this.typePlugin.streamNeedsPostProcessing
          });
        });
      });
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        _id: this._id,
        type: this.type,
        options: this.options
      };
    }
  }], [{
    key: "registerType",
    value: function registerType(type, typePlugin) {
      typePluginMap[type] = typePlugin;
    }
  }, {
    key: "getType",
    value: function getType(type) {
      var typePlugin = typePluginMap[type];
      if (!typePlugin) throw new Error("Unknown item type");
      return typePlugin;
    }
  }]);

  return Item;
}();

exports.default = Item;


Item.registerType("File", new _file2.default());
Item.registerType("Stream", new _stream2.default());
Item.registerType("YouTube", new _youtube2.default());