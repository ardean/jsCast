var ko = window.ko;

ko.bindingHandlers.player = {
  init: function (element, valueAccessor) {
    var options = valueAccessor();
    options.sourcePath.subscribe(onSourcePathChange);
    options.isPlaying.subscribe(onIsPlayingChange);
    options.isMuted.subscribe(onIsMutedChange);
    options.volume.subscribe(onVolumeChange);

    function onSourcePathChange(src) {
      if (src) {
        element.src = src;
        element.play();
      }
    }

    function onIsMutedChange(isMuted) {
      element.muted = isMuted;
    }

    function onIsPlayingChange(isPlaying) {
      if (options.sourcePath()) {
        if (isPlaying) {
          element.play();
        } else {
          element.pause();
        }
      }
    }

    function onVolumeChange(volume) {
      element.volume = volume;
    }

    element.addEventListener("error", function () {
      setTimeout(function () {
        element.load();
        element.play();
      }, 3000);
    });

    element.addEventListener("canplay", function () {
      options.canPlay(true);
    });

    onSourcePathChange(options.sourcePath());
    onIsPlayingChange(options.isPlaying());
    onIsMutedChange(options.isMuted());
    onVolumeChange(options.volume());
  }
};
