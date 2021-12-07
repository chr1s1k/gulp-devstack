import { FocusTrap } from '../utils'

export const Navbar = (navbar: HTMLElement): void => {
  const esc = {
    KEY: 'escape',
  }
  const classes = {
    IS_ACTIVE: 'is-active',
    NAVBAR_OPEN: 'navbar-open',
    NAVBAR_BACKDROP: 'navbar-backdrop',
    NAVBAR_CLOSING: 'navbar-closing',
  }
  const hamburgerBtn = document.querySelector('.js-hamburger--open')
  const hamburgerCloseBtn = document.querySelector('.js-hamburger--close')
  const body = document.body
  const pageOverlay = document.createElement('div')
  const showNavbarEvent = new CustomEvent('show.navbar')
  const hideNavbarEvent = new CustomEvent('hide.navbar')
  const focusTrap = new FocusTrap(navbar)

  pageOverlay.className = classes.NAVBAR_BACKDROP
  pageOverlay.addEventListener('click', () => {
    navbar.dispatchEvent(hideNavbarEvent)
  })
  body.appendChild(pageOverlay)

  hamburgerBtn?.addEventListener('click', () => {
    if (body.classList.contains(classes.NAVBAR_CLOSING)) {
      return
    }

    if (!body.classList.contains(classes.NAVBAR_OPEN)) {
      navbar.dispatchEvent(showNavbarEvent)
    } else {
      navbar.dispatchEvent(hideNavbarEvent)
    }
  })

  navbar.addEventListener('show.navbar', () => {
    body.classList.add(classes.NAVBAR_OPEN)
    hamburgerBtn?.classList.add(classes.IS_ACTIVE)
    hamburgerBtn?.setAttribute('aria-expanded', 'true')

    focusTrap.activate()
  })

  navbar.addEventListener('hide.navbar', () => {
    body.classList.add(classes.NAVBAR_CLOSING)
    body.classList.remove(classes.NAVBAR_OPEN)
    hamburgerBtn?.classList.remove(classes.IS_ACTIVE)
    hamburgerBtn?.setAttribute('aria-expanded', 'false')

    focusTrap.destroy()
  })

  navbar.addEventListener('transitionend', () => {
    // navbar is hidden
    if (!body.classList.contains(classes.NAVBAR_OPEN)) {
      body.classList.remove(classes.NAVBAR_CLOSING)
    }
  })

  // hide the navbar using ESC key
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key?.toLowerCase() === esc.KEY) {
      if (body.classList.contains(classes.NAVBAR_OPEN)) {
        navbar.dispatchEvent(hideNavbarEvent)
      }
    }
  })

  hamburgerCloseBtn?.addEventListener('click', () => {
    navbar.dispatchEvent(hideNavbarEvent)
  })
}
