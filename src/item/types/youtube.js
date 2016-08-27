import ytdl from "ytdl-core";

export default class YouTubeType {
  constructor() {
    this.streamNeedsPostProcessing = true;
  }

  getStream(item, done) {
    done(null, ytdl(item.options.url));
  }

  getMetadata(item, done) {
    ytdl.getInfo(item.options.url, (err, info) => {
      if (err) return done(err);
      done(null, {
        StreamTitle: info.author + " - " + info.title
      });
    });
  }
}
