import { createFocusTrap, FocusTrap as IFocusTrap } from 'focus-trap'

export class FocusTrap {
  private container: HTMLElement
  private focusTrap: IFocusTrap | undefined

  constructor(container: HTMLElement) {
    this.container = container
  }

  activate(): void {
    this.focusTrap = createFocusTrap(this.container, {
      preventScroll: true,
      clickOutsideDeactivates: true,
    })

    this.focusTrap.activate()
  }

  destroy(): void {
    this.focusTrap?.deactivate()
  }
}
