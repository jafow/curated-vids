/* global YT, fetch, Headers */
const html = require('choo/html')
const choo = require('choo')
const css = require('sheetify')
const app = choo()
const config = require('./config.json')
const YT_API_TOKEN = config.YT_API_TOKEN
const YT_PLAYLIST_ID = config.YT_PLAYLIST_ID
css('tachyons')
// const header = css('./assets/styles/headers.css')
const main = css('./assets/styles/main.css')
const pf = css`
  :host {
    color: yellow;
  }`
const pf2 = css`.friend { background: red; }`
app.use(require('choo-devtools')())
app.use(initialState)
app.use(getVideos)
app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  var player
  if (!state.items) state.items = []
  window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady () {
    console.log('iddframe api read')
    player = new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: 'M7lc1UVf-VE',
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    })
  }

  function playOn () {
    player.playVideo()
  }
  function onPlayerReady (event) {
    event.target.playVideo()
  }
  function onPlayerStateChange () {
    console.log('player stae change')
  }
  return html`
    <body class=${pf2}>
      <h1 class=${pf2}>hello world</h1>
      <h2 class=${pf}>${state.message}</h2>
      <h3>${state.currentVideo}</h3>
      <ul>
  ${state.items.map(function (vid) {
    return html`
        <li class=${main}>
          <p>${vid.title}</p>
          <img src=${vid.thumbnail} data-vidId=${vid.videoId}/>
        </li>`
  })}
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

function getVideos (state, emitter) {
  var headers = new Headers()
  var maxResults = 25
  var playlistId = YT_PLAYLIST_ID
  var part = 'snippet%2CcontentDetails'
  var key = YT_API_TOKEN

  var ytURL = 'https://www.googleapis.com/youtube/v3/playlistItems'
  var ytFetchURL = `${ytURL}?key=${key}&maxResults=${maxResults}&playlistId=${playlistId}&part=${part}`
  var fetchInit = {
    method: 'GET',
    headers: headers,
    mode: 'cors',
    cache: 'default'
  }

  emitter.on('DOMContentLoaded', function () {
    state.items = []
    fetch(ytFetchURL, fetchInit).then((response) => {
      if (response.ok) {
        let contentType = response.headers.get('content-type')
        if (contentType && /application\/json/.test(contentType)) {
          return response.json()
        }
      }
    }).then((body) => {
      let b = body
      state.items = b.items.map(formatItem)
      emitter.emit('render')
    })
  })
}

function formatItem (item) {
  return {
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.default.url,
    videoId: item.snippet.resourceId.videoId
  }
}
