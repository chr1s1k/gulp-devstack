const excludeLinks = (links: HTMLAnchorElement[]): void => {
  links.forEach(link => {
    link.setAttribute('tabindex', '-1')
  })
}

const includeLinks = (links: HTMLAnchorElement[]): void => {
  links.forEach(link => {
    link.removeAttribute('tabindex')
  })
}

const matchMediaHandler = (media: MediaQueryList): Promise<boolean> =>
  new Promise((resolve, reject) => {
    if (media.matches) {
      resolve(true)
    } else {
      reject()
    }
  })

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
    includeLinks(navbarLinks)
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

  const matchMedia = !!navbarMobileBp && window.matchMedia(`(max-width: ${navbarMobileBp})`)

  // if custom css property was provide => check for breakpoint changes
  if (matchMedia) {
    // run media check once when page is loaded
    matchMediaHandler(matchMedia).then(() => excludeLinks(navbarLinks))

    // check for breakpoint changes
    matchMedia.addEventListener('change', () => {
      matchMediaHandler(matchMedia)
        .then(() => {
          if (!body.classList.contains(classes.NAVBAR_VISIBLE)) {
            excludeLinks(navbarLinks)
          }
        })
        .catch(() => includeLinks(navbarLinks))
    })
  }
}