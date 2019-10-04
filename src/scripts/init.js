export function init(fn, element, ...args) {
	if (element) {
		fn(element, ...args)
	}
}

export function initMultiple(fn, elements, ...args) {
	if (elements.length) {
		[...elements].forEach(el => {
			fn(el, ...args)
		})
	}
}