import {
  EventEmitter
} from "events";
import shortid from "shortid";
import Item from "../item";

export default class Playlist extends EventEmitter {
  constructor(options) {
    super();

    this._id = options._id || shortid.generate();
    this.items = options.items || [];
    this.items = this.items.map((options) => new Item(options));
    this.index = typeof options.index === "number" ? options.index : -1;
  }

  addItem(options) {
    const item = new Item(options);
    this.items.push(item);
    return item;
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
    item.load((err, stream, metadata, options) => {
      this.emit(eventName, err, stream, metadata, item, options);
    });
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
