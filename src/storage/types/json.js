import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";

export default class JSONType {
  constructor() {}

  activate(options, done) {
    this.folder = options.folder || "./json";
    mkdirp(this.folder, done);
  }

  findAll(done) {
    fs.readdir(this.folder, (err, files) => {
      const playlists = files.map((playlistFile) => {
        const filename = path.join(this.folder, playlistFile);
        const data = fs.readFileSync(filename).toString();
        return JSON.parse(data);
      });
      done && done(null, playlists);
    });
  }

  insert(playlist, done) {
    const jsonString = JSON.stringify(playlist, null, 2);
    const filename = path.join(this.folder, playlist._id + ".json");
    fs.writeFile(filename, jsonString, (err) => {
      if (err) return done && done(err);
      done && done();
    });
  }

  update(playlist, done) {
    this.insert(playlist, done);
  }

  remove(id, done) {
    const filename = path.join(this.folder, id + ".json");
    fs.unlink(filename, (err) => {
      if (err) return done && done(err);
      done && done();
    });
  }
}
