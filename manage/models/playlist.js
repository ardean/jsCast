var Item = window.jscastItem;

function Playlist(options) {
  this._id = options._id;
  this.items = options.items.map(function (item) {
    return new Item(item);
  });
}

Playlist.prototype.findItemById = function (id) {
  return this.items.find(function (item) {
    return item._id === id;
  });
};

Playlist.findById = function (id) {
  return Playlist.entities.find(function (playlist) {
    return playlist._id === id;
  });
};

window.jscastPlaylist = Playlist;
