import 'core-js/modules/es.array.from'

export function init(fn: Function, element: HTMLElement, ...args: any) {
	if (element) {
		fn(element, ...args)
	}
}

export function initMultiple(fn: Function, listOfElements: NodeListOf<HTMLElement>, ...args: any) {
	if (listOfElements.length) {
		const elements = Array.from(listOfElements)

		elements.forEach(el => {
			fn(el, ...args)
		})
	}
}