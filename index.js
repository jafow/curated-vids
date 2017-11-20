/* global YT, fetch, Headers */
const html = require('choo/html')
const choo = require('choo')
const css = require('sheetify')
const app = choo()
const config = require('./config.json')
const YT_API_TOKEN = config.YT_API_TOKEN
const YT_PLAYLIST_ID = config.YT_PLAYLIST_ID
css('tachyons')
css('./assets/styles/headers.css')
css('./assets/styles/main.css')

if (process.env.NODE_ENV === 'dev') {
  app.use(require('choo-devtools')())
}
app.use(getVideos)
app.use(playVideo)
app.use(onVideoComplete)

const mainView = require('./lib/main.js')
const playVideoView = require('./lib/play-video.js')
app.route('/', mainView)
app.route('/vid/:vidId', playVideoView)
app.mount('body')

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
