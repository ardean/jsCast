import "./array-find";
import "./bindings/player";
import $ from "jquery";
import ko from "knockout";
import connection from "./connection";
import localSettings from "./local-settings";
import Playlist from "./models/playlist";

var item = ko.observable();
var metadata = ko.observable();
var playlists = ko.observableArray();
var itemUrl = ko.observable();
var playerSourcePath = ko.observable();
var browserCanPlay = ko.observable(false);
var isPlayerPlaying = ko.observable(localSettings.isPlayerPlaying);
var isPlayerMuted = ko.observable(localSettings.isPlayerMuted);
var playerVolume = ko.observable(localSettings.playerVolume);

const socket = connection.socket;

connection.on("connect", () => {
  socket.emit("fetch");
});

playerVolume.subscribe((volume) => {
  localSettings.save("playerVolume", volume);
});

isPlayerMuted.subscribe((isPlayerMuted) => {
  localSettings.save("isPlayerMuted", isPlayerMuted);
});

socket.on("info", function (info) {
  info.playlists = info.playlists.map(function (playlist) {
    return new Playlist(playlist);
  });

  Playlist.entities = info.playlists.concat();

  playerSourcePath(info.playerSourcePath);
  item(info.item);
  metadata(info.metadata);
  playlists(info.playlists.concat());
});

socket.on("playing", function (itemObj, metadataObj) {
  item(itemObj);
  metadata(metadataObj);
});

socket.on("playlistCreated", function (playlist) {
  playlist = new Playlist(playlist);

  Playlist.entities.push(playlist);
  playlists.push(playlist);
});

socket.on("itemCreated", function (item, playlistId) {
  var playlist = Playlist.findById(playlistId);

  modifyPlaylist(playlist, function () {
    playlist.items.push(item);
  });
});

socket.on("itemRemoved", function (id, playlistId) {
  var playlist = Playlist.findById(playlistId);
  var item = playlist.findItemById(id);

  modifyPlaylist(playlist, function () {
    var itemIndex = playlist.items.indexOf(item);
    playlist.items.splice(itemIndex, 1);
  });
});

socket.on("playlistRemoved", function (playlistId) {
  var playlist = Playlist.findById(playlistId);

  Playlist.entities.splice(Playlist.entities.indexOf(playlist), 1);
  playlists.remove(playlist);
});

function modifyPlaylist(playlist, fn) {
  var index = playlists.indexOf(playlist);
  playlists.remove(playlist);
  fn();
  playlists.splice(index, 0, playlist);
}

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

function removeItem(item, playlist) {
  var shouldRemove = confirm("Remove Item?");
  if (shouldRemove) {
    socket.emit("removeItem", item._id, playlist._id);
  }
}

function removePlaylist(playlist) {
  var shouldRemove = confirm("Remove Playlist?");
  if (shouldRemove) {
    socket.emit("removePlaylist", playlist._id);
  }
}

function playItem(item, playlist) {
  socket.emit("playItem", item._id, playlist._id);
}

function playPlaylist(playlist) {
  socket.emit("playPlaylist", playlist._id);
}

function isPlaying(itemId) {
  var itemValue = item();
  return itemValue && itemId === itemValue._id;
}

ko.applyBindings({
  playerSourcePath: playerSourcePath,
  isPlayerPlaying: isPlayerPlaying,
  isPlayerMuted: isPlayerMuted,
  playerVolume: playerVolume,
  item: item,
  metadata: metadata,
  playlists: playlists,
  itemUrl: itemUrl,
  next: next,
  addPlaylist: addPlaylist,
  addItem: addItem,
  removeItem: removeItem,
  removePlaylist: removePlaylist,
  playItem: playItem,
  playPlaylist: playPlaylist,
  browserCanPlay: browserCanPlay,
  isPlaying: isPlaying
});
