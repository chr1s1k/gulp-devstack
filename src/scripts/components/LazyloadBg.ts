import { generateId } from '../utils'

enum classes {
  LOADED = 'loaded',
  LOADING = 'loading',
}

type CustomOptions = {
  onLoad?: (element: HTMLElement) => void
}

interface Options extends IntersectionObserverInit, CustomOptions {}

export class LazyloadBg {
  private selector: string
  private observer: IntersectionObserver | null = null
  private elements: HTMLElement[] = []
  private options: Options | undefined

  constructor(selector: string, options?: Options) {
    this.selector = selector
    this.options = options

    this.queryElements()
    this.createObserver()

    this.elements.forEach((element) => {
      if (!element.id) {
        element.setAttribute('id', `lazybg_${generateId()}`)
      }
      this.observer?.observe(element)
    })
  }

  private queryElements(): void {
    this.elements = Array.from(document.querySelectorAll<HTMLElement>(this.selector))
  }

  private createObserver(): void {
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          // as soon as the image gets into the viewport => stop observing it
          observer.unobserve(entry.target)

          // load background image
          this.loadImage(entry.target as HTMLElement)
        }
      })
    }, this.options)
  }

  private loadImage(container: HTMLElement): void {
    const { bg } = container.dataset

    if (!bg) return

    const image = new Image()

    image.onload = () => {
      container.classList.remove(classes.LOADING)
      container.classList.add(classes.LOADED)

      const css = `
        #${container.id}::after {
          background-image: url(${bg});
        }
      `

      this.appendStyle(container, css)
      this.options?.onLoad && this.options.onLoad(container)
    }

    container.classList.add(classes.LOADING)
    image.src = bg
  }

  private appendStyle(element: HTMLElement, css: string): void {
    const style = document.createElement('style')
    style.textContent = css
    element.appendChild(style)
  }
}
