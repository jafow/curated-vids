/* global YT */
const html = require('choo/html')
const choo = require('choo')
const app = choo()

app.use(initialState)
app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  function videoClick () {
    let vId = Math.floor(Math.random() * 100)
    console.log('video click', vId)
    emit('videoClick', vId)
  }

  var player
  window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
    console.log('iddframe api read');
    player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: 'M7lc1UVf-VE',
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    })
    console.log('player is: ', player)
  }

  function onPlayerReady (event) {
    console.log('ready freddie')
    event.target.playVideo()
  }
  function onPlayerStateChange () {
    console.log('player stae change')
  }
  return html`
    <body>
      <h1>hello world</h1>
      <h2>${state.message}</h2>
      <h3>${state.currentVideo}</h3>
      <ul>
        <li>vid 1</li>
        <li>vid 2</li>
      </ul>

    <script async src="https://www.youtube.com/iframe_api"></script>
    </body>
  `
}

function initialState (state, emitter) {
  state.message = 'holla mundo'
  emitter.on('videoClick', function (vidId) {
    state.currentVideo = vidId
    emitter.emit('render')
  })
}
