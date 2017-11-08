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

  function onYouTubeIframeAPIReady () {
    console.log('typeof: ', typeof YT.Player)
  }

  return html`
    <body>
      <h1>hello world</h1>
      <h2>${state.message}</h2>
      <h3>${state.currentVideo}</h3>
      <ul>
        <li onclick=${videoClick}>vid 1</li>
        <li onclick=${videoClick}>vid 2</li>
        <li onclick=${onYouTubeIframeAPIReady}>vid 3</li>
      </ul>
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
