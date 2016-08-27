export default class MemoryType {
  constructor() {
    this.isFillable = true;
  }

  activate(options, done) {
    this.playlistIdMap = {};
    done && done();
  }

  fill(playlists, done) {
    playlists.forEach((playlist) => this.insert(playlist));
    done && done();
  }

  findAll(done) {
    const playlists = Object.keys(this.playlistIdMap).map((playlistId) => this.playlistIdMap[playlistId]);
    done && done(null, playlists);
  }

  insert(playlist, done) {
    this.playlistIdMap[playlist._id] = playlist;
    done && done();
  }

  update(playlist, done) {
    this.playlistIdMap[playlist._id] = playlist;
    done && done();
  }

  remove(id, done) {
    delete this.playlistIdMap[id];
    done && done();
  }
}
