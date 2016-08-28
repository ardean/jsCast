# jscast
[![NPM Version](http://img.shields.io/npm/v/jscast.svg?style=flat)](https://www.npmjs.org/package/jscast)

A SHOUTcast Server/Library written in JavaScript

## Installation

As dependency:

```sh
$ npm install jscast
```

For developing forks:

```sh
$ git clone https://github.com/BigTeri/jscast
```

```sh
$ cd jscast
$ npm i
```

```sh
$ npm start
```

For minimalists:

```sh
$ npm i -g jscast
```

```sh
$ jscast-server
```

### Prerequisites

jscast uses [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#prerequisites) so ffmpeg **needs** to be installed on your system.

## Quick Start

### Using cli

Install jscast globally:

```sh
$ npm i -g jscast
```

Use the new command to start a Server:

```sh
$ jscast-server
```
choose a different port with *-p 8888*

### Using script

```js
var Server = require("jscast").Server;

new Server().on("play", function (item, metadata) {
  console.log("playing " + metadata.options.StreamTitle);
}).start(8000, function (server) {
  console.log("jscast server is running on http://localhost:" + server.port);
  console.log("go to http://localhost:" + server.port + "/manage to manage your playlists");
});
```

## Item Types

Built-in item types:

- **File** gets audio files from the filesystem using the *filename* option
- **YouTube** fetches the audio data and info from YouTube using an *url* option
- Use **Stream** to hand over a Readable Stream object with the *stream* option

[more](#custom-items) item types

## Storage Types

Built-in storage types:

- JSON creates a folder with a json file per playlist, filename is the playlist id
- Memory stores playlists in memory, so **changes will be lost** on shutdown

If thats not enough, you can create [your own one](#custom-storages)

## Examples

### Custom Items

jscast has playlists with typed items.
You can easily add your own item type:

```js
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
}).start();
```

### Custom Storages

You can use the built-in [storage types](#api) or create your own one:

```js
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
}).start();
```

## API

TODO...

## License

MIT
