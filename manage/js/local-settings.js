class LocalSettings {
  constructor() {
    const isPlayerPlaying = localStorage.getItem("isPlayerPlaying");
    this.isPlayerPlaying = typeof isPlayerPlaying === "boolean" ? isPlayerPlaying : true;
    this.isPlayerMuted = localStorage.getItem("isPlayerMuted") || false;
    this.playerVolume = localStorage.getItem("playerVolume") || 0.75;
  }

  save(propertyName, value) {
    this[propertyName] = value;
    localStorage.setItem(propertyName, value);
  }
}

export default new LocalSettings();
