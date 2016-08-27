import fs from "fs";
import path from "path";

export default class FileType {
  constructor() {
    this.streamNeedsPostProcessing = true;
  }

  getStream(item, done) {
    done(null, fs.createReadStream(item.options.filename));
  }

  getMetadata(item, done) {
    done(null, {
      StreamTitle: item.options.title || path.basename(item.options.filename, path.extname(item.options.filename))
    });
  }
}
