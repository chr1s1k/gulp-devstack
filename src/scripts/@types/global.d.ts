interface IBlueimp {
  Gallery: (
    list: NodeList | HTMLCollection | Record<string, any>[],
    options?: Record<string, unknown>,
  ) => void
}

interface IMiniLazyload {
  (options?: Record<string, unknown>, selector?: string, ignoreNative?: boolean): void
  IGNORE_NATIVE_LAZYLOAD: boolean
}

// extend window with custom objects
declare global {
  interface Window {
    blueimp: IBlueimp
    MiniLazyload: IMiniLazyload
    initUI: (container: HTMLElement | Document) => void
  }
}

export {}
