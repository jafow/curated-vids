const html = require('choo/html')
const TITLE = 'route not found'

module.exports = oopsView

function oopsView (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  return html`
    <body>
      <section class="vh-100 bg-light-blue avenir">
        <header class="tc ph3 lh-copy">
          <h1 class="f1 f-headline-l fw9 purple">Oops :-(</h1>
        </header>
      </section>
      <h2 class="
    </body>
  `
}
