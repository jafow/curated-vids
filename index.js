/* global YT, fetch, Headers */
const html = require('choo/html')
const choo = require('choo')
const css = require('sheetify')
const app = choo()
const config = require('./config.json')
const YT_API_TOKEN = config.YT_API_TOKEN
const YT_PLAYLIST_ID = config.YT_PLAYLIST_ID
css('tachyons')
const header = css('./assets/styles/headers.css')
const main = css('./assets/styles/main.css')
const pf2 = css`.friend { background: red; }`
const prefix = css`
  :host {
    list-style: none;
    font-weight: 600;
    font-size: 18px;
  }
  :host > p {
    color: pink;
  }
`
if (process.env.NODE_ENV === 'dev') {
  app.use(require('choo-devtools')())
}
app.use(getVideos)
app.use(playVideo)
app.use(onVideoComplete)

app.route('/', mainView)
app.route('/vid/:vidId', require('./lib/play-video.js'))
app.mount('body')

function mainView (state, emit) {
  var player
  if (!state.items) state.items = []
  if (!state.currentVideo) state.currentVideo = ''

  function play (evt) {
    emit('playVideo', {
      vidId: evt.target.getAttribute('data-vidId'),
      player: player
    })
  }

  return html`
    <body class=${pf2}>
      <h1 class=${pf2}>hello world</h1>
      <h3>${state.currentVideo}</h3>
      <ul>
  ${state.items.map(function vidItem (vid) {
    return html`
        <li class=${prefix} onclick=${play}>
          <img src=${vid.thumbnail} data-vidId=${vid.videoId}/>
          <p>${vid.title}</p>
        </li>
      `
  })}
      </ul>
    </body>
  `
}

function playVideo (state, emitter, app) {
  emitter.on('playVideo', function (vid) {
    state.currentVideo = vid.vidId
    state.videoComplete = false
    emitter.emit('pushState', `/vid/${state.currentVideo}`)
  })
}

function onVideoComplete (state, emitter) {
  emitter.on('video-complete', function (vid) {
    state.videoComplete = true
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
