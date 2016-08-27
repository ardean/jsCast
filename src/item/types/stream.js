export default class StreamType {
  constructor() {
    this.streamNeedsPostProcessing = true;
  }

  getStream(item, done) {
    done(null, item.options.stream);
  }

  getMetadata(item, done) {
    done(null, {
      StreamTitle: item.options.title || ""
    });
  }
}
