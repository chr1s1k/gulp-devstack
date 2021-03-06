export const Lazyload = (selector: string): void => {
  if (window.MiniLazyload) {
    window.MiniLazyload(
      {
        rootMargin: '200px',
      },
      selector,
      window.MiniLazyload.IGNORE_NATIVE_LAZYLOAD,
    )
  } else {
    // eslint-disable-next-line no-console
    console.error('Lazyloading is not working because dependent library is missing!')
  }
}
