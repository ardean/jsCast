function LocalSettings() {
  const isPlayerPlaying = localStorage.getItem("isPlayerPlaying");
  this.isPlayerPlaying = typeof isPlayerPlaying === "boolean" ? isPlayerPlaying : true;
  this.isPlayerMuted = localStorage.getItem("isPlayerMuted") || false;
  this.playerVolume = localStorage.getItem("playerVolume") || 0.75;
}

LocalSettings.prototype.save = function (propertyName, value) {
  this[propertyName] = value;
  localStorage.setItem(propertyName, value);
};

window.jscastLocalSettings = new LocalSettings();
