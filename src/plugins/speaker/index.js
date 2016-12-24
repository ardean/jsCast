import lame from "lame";
import Speaker from "speaker";
import Station from "../../station";

export default class SpeakerType {
  activate(options) {
    options = options || {};

    this.stationOptions = options.stationOptions || {};
    this.station = options.station || new Station(this.stationOptions);

    this.decoder = options.decoder || new lame.Decoder();
    this.speaker = options.speaker || new Speaker();

    this.station.on("data", (data) => {
      if (data && data.length) {
        this.decoder.write(data);
      }
    });

    this.decoder.pipe(this.speaker);
  }
}
