"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require("events");

var _shortid = require("shortid");

var _shortid2 = _interopRequireDefault(_shortid);

var _item = require("../item");

var _item2 = _interopRequireDefault(_item);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Playlist extends _events.EventEmitter {
  constructor(options) {
    super();

    this._id = options._id || _shortid2.default.generate();
    this.items = options.items || [];
    this.items = this.items.map(options => new _item2.default(options));
    this.index = typeof options.index === "number" ? options.index : -1;
  }

  addItem(options) {
    const item = new _item2.default(options);
    this.items.push(item);
    return item;
  }

  removeItem(id) {
    const item = this.findItemById(id);
    if (item) {
      const index = this.items.indexOf(item);
      if (index > -1) {
        this.items.splice(index, 1);
        return item;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  findItemById(id) {
    return this.items.find(item => item._id === id);
  }

  replaceItemByItemId(itemId) {
    const item = this.findItemById(itemId);
    return this.replaceItem(item);
  }

  replaceItem(item) {
    if (!item) return false;
    this.loadItem(item, "replace");
    return true;
  }

  loadItem(item, eventName) {
    item.load((err, stream, metadata, options) => {
      this.emit(eventName, err, stream, metadata, item, options);
    });
  }

  playNext() {
    return this.next("play");
  }

  replaceNext() {
    return this.next("replace");
  }

  next(eventName) {
    this.setNextIndex();
    const item = this.items[this.index];
    if (!item) return false;
    this.loadItem(item, eventName);
    return true;
  }

  setNextIndex() {
    if (this.index + 1 >= this.items.length) {
      this.index = 0;
      return this.index;
    } else {
      return ++this.index;
    }
  }

  toJSON() {
    return {
      _id: this._id,
      items: this.items
    };
  }
}
exports.default = Playlist;