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
    return this.items.find((item) => item._id === id);
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
