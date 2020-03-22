export const getOffsetTop = (element: HTMLElement): number => {
  if (!element) {
    return 0
  }

  const currentScrollPosition =
    window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0

  return element.getBoundingClientRect().top + currentScrollPosition
}
