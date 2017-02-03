import Item from "./item.js";

export default class Playlist {
  constructor(options) {
    this._id = options._id;
    this.items = options.items.map((item) => new Item(item));
  }

  findItemById(id) {
    return this.items.find((item) => item._id === id);
  }

  static findById(id) {
    return Playlist.entities.find((playlist) => playlist._id === id);
  }
}
