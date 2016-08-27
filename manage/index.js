var $ = window.$;
var io = window.io;
var ko = window.ko;

$(function () {
  var item = ko.observable();
  var metadata = ko.observable();
  var playlists = ko.observableArray();
  var itemUrl = ko.observable();

  var socket = io(location.host, {
    path: location.pathname + "sockets"
  });

  socket.on("connect", function () {
    socket.emit("fetch");
  });

  socket.on("info", function (info) {
    item(info.item);
    metadata(info.metadata);
    playlists(info.playlists);
  });

  socket.on("playing", function (itemObj, metadataObj) {
    item(itemObj);
    metadata(metadataObj);
  });

  socket.on("playlistCreated", function (playlist) {
    playlists.push(playlist);
  });

  socket.on("itemCreated", function (item, playlistId) {
    var playlist = playlists().find(function (playlist) {
      return playlist._id === playlistId;
    });
    var index = playlists.indexOf(playlist);
    playlists.remove(playlist);
    playlist.items.push(item);
    playlists.splice(index, 0, playlist);
  });

  function next() {
    socket.emit("next");
  }

  function addPlaylist() {
    socket.emit("addPlaylist");
  }

  function addItem() {
    var url = itemUrl();
    if (!url) return;

    var item = {
      type: "YouTube",
      options: {
        url: url
      }
    };

    itemUrl("");

    socket.emit("addItem", item);
  }

  function playPlaylist(playlist) {
    socket.emit("playPlaylist", playlist._id);
  }

  function isPlaying(itemId) {
    var itemValue = item();
    return itemValue && itemId === itemValue._id;
  }

  ko.applyBindings({
    item: item,
    metadata: metadata,
    playlists: playlists,
    itemUrl: itemUrl,
    next: next,
    addPlaylist: addPlaylist,
    addItem: addItem,
    playPlaylist: playPlaylist,
    isPlaying: isPlaying
  });
});
