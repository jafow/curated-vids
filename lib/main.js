const html = require('choo/html')

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
    <body>
      <h3>${state.currentVideo}</h3>
      <ul class="list center ph3-ns">

  ${state.items.map(function vidItem (vid) {
    return html`
        <li class="fl w-100 w-50-ns pa2" onclick=${play}>
          <img src=${vid.thumbnail} data-vidId=${vid.videoId}/>
          <p>${vid.title}</p>
        </li>
      `
  })}

      </ul>
    </body>
  `
}

module.exports = mainView
