import shortid from "shortid";
import FileType from "./types/file";
import StreamType from "./types/stream";
import YouTubeType from "./types/youtube";

const typePluginMap = {};

export default class Item {
  constructor(options) {
    this._id = shortid.generate();
    this.type = options.type;
    this.options = options.options;
    this.typePlugin = Item.getType(this.type);
  }

  load(done) {
    this.typePlugin.getStream(this, (err, stream) => {
      if (err) return done(err);
      stream.once("error", () => {});

      this.typePlugin.getMetadata(this, (err, metadata) => {
        if (err) {
          stream.destroy();
          return done(err);
        }

        done(null, stream, metadata, {
          streamNeedsPostProcessing: this.typePlugin.streamNeedsPostProcessing
        });
      });
    });
  }

  toJSON() {
    return {
      _id: this._id,
      type: this.type,
      options: this.options
    };
  }

  static registerType(type, typePlugin) {
    typePluginMap[type] = typePlugin;
  }

  static getType(type) {
    const typePlugin = typePluginMap[type];
    if (!typePlugin) throw new Error("Unknown item type");
    return typePlugin;
  }
}

Item.registerType("File", new FileType());
Item.registerType("Stream", new StreamType());
Item.registerType("YouTube", new YouTubeType());
