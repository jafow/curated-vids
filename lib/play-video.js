const html = require('choo/html')

function playVideoView (state, emit) {
  var player
  window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady () {
    player = new YT.Player('video-player', {
      height: '390',
      width: '465',
      events: {
        'onReady': startPlayer,
        'onStateChange': stateChanged
      }
    })
  }

  function startPlayer () {
    var playerVars = {
      modestbranding: 1,
      enablejsapi: 1,
      origin: window.origin,
      rel: 0,
      showInfo: 0,
      iv_load_policy: 3
    }
    player.loadVideoById({
      videoId: state.currentVideo,
      startSeconds: 4,
      suggestedQuality: 'medium',
      playerVars: playerVars
    })
  }

  function stateChanged (e) {
    console.log('state change: ', e)
  }

  return html`
    <body>
      <h1>Playing ${state.currentVideo}</h1>
      <div id="video-player" class=${state.isPlaying ? 'is-playing' : 'hide'}></div>
      <script src="https://www.youtube.com/iframe_api" async></script>
    </body>
  `
}

module.exports = playVideoView
