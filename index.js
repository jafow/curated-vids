const choo = require('choo')
const css = require('sheetify')
const xhr = require('xhr')
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
const oopsView = require('./lib/oops.js')
app.route('/', mainView)
app.route('/vid/:vidId', playVideoView)
app.route('/oops', oopsView)
app.route('*', oopsView)

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
  var maxResults = 25
  var playlistId = YT_PLAYLIST_ID
  var part = 'snippet%2CcontentDetails'
  var key = YT_API_TOKEN

  var ytURL = 'https://www.googleapis.com/youtube/v3/playlistItems'
  var ytFetchURL = `${ytURL}?key=${key}&maxResults=${maxResults}&playlistId=${playlistId}&part=${part}`
  var xhrOpts = {
    method: 'GET',
    sync: false,
    url: ytFetchURL,
    uri: ytFetchURL,
    json: true
  }

  emitter.on('DOMContentLoaded', function () {
    state.items = []
    xhr(xhrOpts, (err, response, body) => {
      if (err) throw new Error(err)
      if (response.statusCode < 400) {
        var contentType = response.headers['content-type']
        if (contentType && /application\/json/.test(contentType)) {
          state.items = body.items.map(formatItem)
          emitter.emit('render')
        }
      }
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
