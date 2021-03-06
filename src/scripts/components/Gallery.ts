export const Gallery = (container: HTMLElement): void => {
  if (window.blueimp) {
    // https://github.com/blueimp/Gallery/blob/master/README.md#setup
    container.onclick = (event: MouseEvent) => {
      event = event || window.event
      let target: HTMLImageElement | null = (event.target as HTMLImageElement) || event.srcElement

      // enable open lightbox by using `enter` key
      if (target.tagName.toLowerCase() === 'a') {
        target = target.querySelector('img')
      }

      // <img> must be direct descendant of <a> element
      // need adjustment in case of pseudo elements on <a>
      if (target && target.src) {
        const link = target.src ? target.parentNode : target
        const options = {
          index: link,
          event,
        }
        const links = container.querySelectorAll('a')

        // gallery initialization
        window.blueimp.Gallery(links, options)
      }

      return false
    }
  }
}
