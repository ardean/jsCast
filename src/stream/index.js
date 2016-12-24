import {
  EventEmitter
} from "events";
import StreamInfo from "./info";

export default class Stream extends EventEmitter {
  constructor(options) {
    super();

    options = options || {};
    this.bufferSize = options.bufferSize || 8192;
    this.prebufferSize = options.prebufferSize || this.bufferSize * 20;
    this.dataInterval = options.dataInterval || 500;
    this.needMoreData = options.needMoreData || function () {};
    this.streamInfos = [];
  }

  start() {
    this.dataLoop = this.dataLoop.bind(this);
    this.dataLoop();
  }

  dataLoop() {
    this.checkNextStream();

    const streamInfo = this.streamInfos[0];
    if (streamInfo && streamInfo.isHeaderPresent) {
      const bufferAmountToSend = streamInfo.calculateBufferAmountToSend(this.bufferSize);
      for (let i = 0; i < bufferAmountToSend; i++) {
        const previousBuffer = this.previousBuffer || new Buffer([]);
        const bufferToSend = this.collectRealtimeBuffer(previousBuffer, this.bufferSize);
        if (bufferToSend) {
          if (bufferToSend.length >= this.bufferSize) {
            this.previousBuffer = null;
            this.emit("data", bufferToSend, streamInfo.metadata, streamInfo.item);
          } else {
            this.previousBuffer = bufferToSend;
            console.log("buffer to small");
          }
        } else {
          console.log("no buffer");
        }
      }
    }

    setTimeout(this.dataLoop, this.dataInterval);
  }

  collectRealtimeBuffer(realtimeBuffer) {
    const streamInfo = this.streamInfos[0];
    if (realtimeBuffer.length >= this.bufferSize) return realtimeBuffer;
    if (!streamInfo) return realtimeBuffer;

    const missingBytes = this.bufferSize - realtimeBuffer.length;
    realtimeBuffer = Buffer.concat([realtimeBuffer, streamInfo.cutBeginOfBuffer(missingBytes)]);

    streamInfo.processedBytes += realtimeBuffer.length;

    if (realtimeBuffer.length < this.bufferSize) {
      const streamInfo = this.streamInfos.shift();
      streamInfo.destroy();
      return this.collectRealtimeBuffer(realtimeBuffer);
    }

    return realtimeBuffer;
  }

  getRealtimeBufferSize() {
    return this.streamInfos
      .map(streamInfo => streamInfo.buffer.length)
      .reduce((previous, length) => {
        return previous + length;
      }, 0);
  }

  next(stream, metadata, item) {
    this.streamInfos.push(new StreamInfo(stream, metadata, item));
    this.checkNextStream();
  }

  replace(stream, metadata, item) {
    this.streamInfos.forEach((streamInfo) => streamInfo.destroy());
    this.streamInfos = [new StreamInfo(stream, metadata, item)];
    this.didAlreadyRequest = true;
    this.checkNextStream();
  }

  checkNextStream() {
    if (!this.isCollectingData() && this.getRealtimeBufferSize() <= this.prebufferSize) {
      const streamInfo = this.getCollectableStreamInfo();
      if (streamInfo) {
        streamInfo.once("collected", () => {
          this.didAlreadyRequest = false;
        });
        streamInfo.collect();
      } else {
        if (!this.didAlreadyRequest) {
          this.didAlreadyRequest = true;
          this.needMoreData();
        }
      }
    }
  }

  getCollectableStreamInfo() {
    return this.streamInfos.find((streamInfo) => {
      return !streamInfo.isCollected;
    });
  }

  isCollectingData() {
    return this.streamInfos.some((streamInfo) => {
      return streamInfo.isCollecting;
    });
  }
}
