export const Document = (rootEl: HTMLElement): void => {
  const isiOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const isSafari = !!navigator.userAgent.match(/Version\/[\d\\.]+.*Safari/)

  rootEl.classList.remove('no-js')
  rootEl.classList.add('js')

  if (isiOS) {
    rootEl.classList.add('ios')
  }

  if (isSafari) {
    rootEl.classList.add('safari')
  }
}
