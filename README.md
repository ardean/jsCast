# jscast

[![NPM Version](http://img.shields.io/npm/v/jscast.svg?style=flat)](https://www.npmjs.org/package/jscast)

A SHOUTcast Server/Library written in JavaScript

![jscast - manage](/docs/images/jscast-manage.png)

## Quick Start

### Using CLI

Install jscast globally:

```sh
$ npm i -g jscast
```

Use the new command to start a Server:

```sh
$ jscast
```

- override default port: `-p PORT` / `--port PORT`
- change storage type: `-s TYPE` / `--storage-type TYPE`
- ffmpeg binary path: `--ffmpeg-path PATH`
- initial youtube items - fillable storage types **only**: `--youtube-items URL1,URL2`
- whitelist: `--whitelist COUNTRY1,COUNTRY2`
- blacklist: `--blacklist COUNTRY3,COUNTRY4`

### Using Script

```javascript
var Server = require("jscast").Server;

new Server().on("play", function (item, metadata) {
  console.log("playing " + metadata.options.StreamTitle);
}).listen(8000, function (server) {
  console.log("jscast server is running");
  console.log("listen on http://localhost:" + server.port + server.icyServerRootPath);
  console.log("manage on http://localhost:" + server.port + server.manageRootPath + " your playlists and items");
});
```

## Prerequisites

first of all install [NodeJS](https://nodejs.org/), jscast is based on it.

jscast uses [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#prerequisites) as dependency so ffmpeg **needs** to be installed on your system.

## Installation

As dependency:

```sh
$ npm install jscast
```

Play around and contribute to the project:

```sh
$ git clone https://github.com/BigTeri/jscast
$ cd jscast
$ npm i
$ npm start
```

## Manage

**Manage** is a `webapp` to control jscast playlists and items. the route is `/manage` by default. At the moment there is just a `YouTube` type implemented but the idea is to `control` everything with `manage`. There is also a `player` (using a audio tag) embedded to `play` the `SHOUTcast output`, however for me this worked only with a `Desktop-Browser`. god knows why...

## IcyServer

The **IcyServer**'s task is to send the `SHOUTcast data` (received from the Station) to the `clients`. the route is `/` by default.

## Server

The jscast **Server** combines `Manage` and the `IcyServer` to a simple to use application.

## Station

The **Station** is the core class which controls the `Stream` with his `data` and whatever currently is playing.

## Item Types

Built-in item types:

- **File** gets audio files from the filesystem using the `filename` option
- **YouTube** fetches the audio data and info from YouTube using an `url` option
- Use **Stream** to hand over a Readable Stream object with the `stream` option

[more](#custom-items) item types

## Storage Types

Built-in storage types:

- **JSON** creates a folder with a json file per playlist, filename is the `playlist id`
- **Memory** stores playlists in memory, so `changes will be lost` on shutdown

If thats not enough, you can create [your own one](#custom-storages)

## Examples

### Custom Items

jscast has playlists with [typed items](#item-types). You can easily add your own item type:

```javascript
var fs = require("fs");
var jscast = require("jscast");
var Item = jscast.Item;
var Server = jscast.Server;

function MyItemType() {
  this.streamNeedsPostProcessing = true; // indicates if stream should be post processed to mp3
}

MyItemType.prototype.getStream = function (item, done) {
  // get stream code...
  console.log(item.type); // MyItem
  done && done(err, stream);
};

MyItemType.prototype.getMetadata = function (item, done) {
  // get metadata code...
  console.log(item.options.myProp); // myValue
  done && done(err, {
    StreamTitle: "my title"
  });
};

Item.registerType("MyItem", new MyItemType());

new Server({
  storageType: "Memory",
  playlists: [{
    type: "MyItem",
    options: {
      myProp: "myValue"
    }
  }, {
    type: "YouTube",
    options: {
      url: "https://www.youtube.com/watch?v=hhHXAMpnUPM"
    }
  }, {
    type: "Stream",
    options: {
      title: "A cool audio stream!",
      stream: fs.creadReadStream("./sound.mp3")
    }
  }, {
    type: "File",
    options: {
      title: "NICE TRACK!",
      filename: "./myTrack.mp3"
    }
  }]
}).listen();
```

### Custom Storages

You can use the built-in [storage types](#storage-types) or create your own one:

```javascript
var fs = require("fs");
var jscast = require("jscast");
var Storage = jscast.Storage;
var Server = jscast.Server;

function MyStorageType() {
  this.isFillable = true; // indicates that this type can be pre filled on init
}

MyStorageType.prototype.activate = function (options, done) {
  // initialize code...
  done && done(err);
};

MyStorageType.prototype.fill = function (playlists, done) {
  // fill storage from playlists option in Server and Station class
  done && done(err);
};

MyStorageType.prototype.findAll = function (done) {
  // findAll code...
  done && done(err, playlists);
};

MyStorageType.prototype.insert = function (playlist, done) {
  // insert code...
  done && done(err);
};

MyStorageType.prototype.update = function (playlist, done) {
  // update code...
  done && done(err);
};

MyStorageType.prototype.remove = function (playlistId, done) {
  // remove code...
  done && done(err);
};

Storage.registerType("MyStorage", new MyStorageType());

new Server({
  storageType: "MyStorage"
}).listen();
```

## TODO

- API
- Auth

## License

MIT
