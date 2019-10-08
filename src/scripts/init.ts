export function init(fn: Function, element: HTMLElement | null, ...args: any) {
	if (element) {
		fn(element, ...args)
	}
}

export function initMultiple(fn: Function, listOfElements: NodeListOf<HTMLElement> | HTMLCollection, ...args: any) {
	if (listOfElements.length) {
		const elements = Array.from(listOfElements)

		elements.forEach(el => {
			fn(el, ...args)
		})
	}
}