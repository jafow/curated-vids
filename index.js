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
// const main = css('./assets/styles/main.css', {global: true})
const pf = css`
  :host {
    color: yellow;
  }`
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

app.use(require('choo-devtools')())
app.use(initialState)
app.use(getVideos)
app.use(playVideo)

app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  var player
  if (!state.items) state.items = []
  if (!state.currentVideo) state.currentVideo = ''
  window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady () {
    player = new YT.Player('fart', {
      height: '390',
      width: '465',
      videoId: state.currentVideo,
      events: {
        'onReady': playOn,
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
  function play (evt) {
    console.log('targ: ', evt.target.getAttribute('data-vidId'))
    emit('playVideo', {vidId: evt.target.getAttribute('data-vidId')})
  }

  return html`
    <body class=${pf2}>
      <h1 class=${pf2}>hello world</h1>
      <h2 class=${pf}>${state.message}</h2>
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
      <div id="fart"></div>
    <script>
      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    </script>
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

function playVideo (state, emitter) {
  emitter.on('playVideo', function (vidId) {
    state.currentVideo = vidId
    window.postMessage(JSON.stringify({type: 'butt', data: '**88**'}), '*')
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
