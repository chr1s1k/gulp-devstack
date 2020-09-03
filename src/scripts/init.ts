type FunctionType = (el: HTMLElement, ...args: any) => void

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function init(fn: FunctionType, element: HTMLElement | null, ...args: any): void {
  if (element) {
    fn(element, ...args)
  }
}

export function initMultiple(
  fn: FunctionType,
  listOfElements: NodeListOf<HTMLElement> | HTMLCollection,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  ...args: any
): void {
  if (listOfElements.length) {
    const elements = Array.from(listOfElements)

    elements.forEach(el => {
      fn(el as HTMLElement, ...args)
    })
  }
}
