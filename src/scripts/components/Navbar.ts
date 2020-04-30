const excludeLinks = (links: HTMLAnchorElement[]): void => {
  links.forEach(link => {
    link.setAttribute('tabindex', '-1')
  })
}

export const Navbar = (navbar: HTMLElement): void => {
  const esc = {
    KEY: 'escape',
    KEY_CODE: 27,
  }
  const classes = {
    IS_ACTIVE: 'is-active',
    NAVBAR_VISIBLE: 'navbar-visible',
    NAVBAR_BACKDROP: 'navbar-backdrop',
  }
  const hamburger = document.querySelector('.js-hamburger')
  const body = document.body
  const pageOverlay = document.createElement('div')
  const showNavbarEvent = new CustomEvent('show.navbar')
  const hideNavbarEvent = new CustomEvent('hide.navbar')
  const navbarLinks = Array.from(navbar.querySelectorAll('a'))
  const navbarMobileBp = getComputedStyle(navbar).getPropertyValue('--navbar-mobile-bp')

  pageOverlay.className = classes.NAVBAR_BACKDROP
  pageOverlay.addEventListener('click', () => {
    navbar.dispatchEvent(hideNavbarEvent)
  })
  body.appendChild(pageOverlay)

  hamburger?.addEventListener('click', () => {
    if (!body.classList.contains(classes.NAVBAR_VISIBLE)) {
      navbar.dispatchEvent(showNavbarEvent)
    } else {
      navbar.dispatchEvent(hideNavbarEvent)
    }
  })

  navbar.addEventListener('show.navbar', () => {
    body.classList.add(classes.NAVBAR_VISIBLE)
    hamburger?.classList.add(classes.IS_ACTIVE)
    hamburger?.setAttribute('aria-expanded', 'true')

    // include links back to tab flow
    navbarLinks.forEach(link => {
      link.removeAttribute('tabindex')
    })
  })

  navbar.addEventListener('hide.navbar', () => {
    body.classList.remove(classes.NAVBAR_VISIBLE)
    hamburger?.classList.remove(classes.IS_ACTIVE)
    hamburger?.setAttribute('aria-expanded', 'false')

    // exclude "hidden" links from tab flow
    excludeLinks(navbarLinks)
  })

  // hide the navbar using ESC key
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    if (
      (event.key !== undefined && event.key.toLowerCase() === esc.KEY) ||
      event.keyCode === esc.KEY_CODE
    ) {
      if (body.classList.contains(classes.NAVBAR_VISIBLE)) {
        navbar.dispatchEvent(hideNavbarEvent)
      }
    }
  })

  // if page is load on mobile and navbar is not visible => exclude links from tab flow
  if (
    !!navbarMobileBp &&
    window.matchMedia(`(max-width: ${navbarMobileBp})`).matches &&
    !body.classList.contains(classes.NAVBAR_VISIBLE)
  ) {
    excludeLinks(navbarLinks)
  }
}
