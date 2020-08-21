// detect support for the behavior property in ScrollOptions
const isNativeSmoothScrollSupported = 'scrollBehavior' in document.documentElement.style

const getOffsetTop = (element: HTMLElement): number => {
  if (!element) {
    return 0
  }

  const currentScrollPosition =
    window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0

  return element.getBoundingClientRect().top + currentScrollPosition
}

export const scrollToElement = (element: HTMLElement): void => {
  if (element) {
    const targetOffsetTop = getOffsetTop(element)

    if (isNativeSmoothScrollSupported) {
      window.scroll({
        behavior: 'smooth',
        top: targetOffsetTop,
      })
    } else {
      window.scroll(0, targetOffsetTop)
    }
  }
}
