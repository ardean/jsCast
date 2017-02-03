import { EventEmitter } from "events";
import { MP3 as Mp3Parser } from "sm-parsers";
import destroy from "destroy";

export default class StreamInfo extends EventEmitter {
  constructor(stream, metadata, item) {
    super();

    this.stream = stream;
    this.metadata = metadata;
    this.item = item;

    this.isCollected = false;
    this.isCollecting = false;
    this.buffer = new Buffer([]);
    this.parser = new Mp3Parser();
    this.processedBytes = 0;

    this.stream.once("end", () => {
      this.isCollected = true;
      this.isCollecting = false;

      this.emit("collected", this);
    });

    this.parser
      .once("frame", (data, firstHeader) => {
        this.setHeader(firstHeader);
      }).on("frame", (data) => {
        this.appendToBuffer(data);
      });
  }

  collect() {
    this.isCollecting = true;
    this.stream.pipe(this.parser);
  }

  setHeader(firstHeader) {
    this.isHeaderPresent = true;
    this.RTC = new Date();
    this.bytesPerMillisecond = firstHeader.frames_per_sec * firstHeader.frameSizeRaw / 1000;
  }

  appendToBuffer(data) {
    this.buffer = Buffer.concat([this.buffer, data]);
  }

  cutBeginOfBuffer(length) {
    const removedBuffer = this.buffer.slice(0, length);
    this.buffer = this.buffer.slice(length, this.buffer.length);
    return removedBuffer;
  }

  calculateBufferAmountToSend(bufferSize) {
    const millisecondsSinceStart = new Date() - this.RTC;
    const bytesSinceStart = millisecondsSinceStart * this.bytesPerMillisecond;
    const buffersSinceStart = Math.floor(bytesSinceStart / bufferSize);
    const processedBuffers = Math.floor(this.processedBytes / bufferSize);
    return buffersSinceStart - processedBuffers;
  }

  destroy() {
    destroy(this.stream);
    this.stream.removeAllListeners();
    this.stream = null;

    destroy(this.parser);
    this.parser.removeAllListeners();
    this.parser = null;
  }
}
