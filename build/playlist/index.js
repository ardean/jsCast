"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require("events");

var _shortid = require("shortid");

var _shortid2 = _interopRequireDefault(_shortid);

var _item = require("../item");

var _item2 = _interopRequireDefault(_item);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Playlist = function (_EventEmitter) {
  _inherits(Playlist, _EventEmitter);

  function Playlist(options) {
    _classCallCheck(this, Playlist);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Playlist).call(this));

    _this._id = options._id || _shortid2.default.generate();
    _this.items = options.items || [];
    _this.items = _this.items.map(function (options) {
      return new _item2.default(options);
    });
    _this.index = typeof options.index === "number" ? options.index : -1;
    return _this;
  }

  _createClass(Playlist, [{
    key: "addItem",
    value: function addItem(options) {
      var item = new _item2.default(options);
      this.items.push(item);
      return item;
    }
  }, {
    key: "playNext",
    value: function playNext() {
      return this.next("play");
    }
  }, {
    key: "replaceNext",
    value: function replaceNext() {
      return this.next("replace");
    }
  }, {
    key: "next",
    value: function next(eventName) {
      var _this2 = this;

      this.setNextIndex();
      var item = this.items[this.index];
      if (!item) return false;
      item.load(function (err, stream, metadata, options) {
        _this2.emit(eventName, err, stream, metadata, item, options);
      });
      return true;
    }
  }, {
    key: "setNextIndex",
    value: function setNextIndex() {
      if (this.index + 1 >= this.items.length) {
        this.index = 0;
        return this.index;
      } else {
        return ++this.index;
      }
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        _id: this._id,
        items: this.items
      };
    }
  }]);

  return Playlist;
}(_events.EventEmitter);

exports.default = Playlist;