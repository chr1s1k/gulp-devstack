export default function Gallery(container: HTMLElement) {
	if (window.blueimp) {

		// https://github.com/blueimp/Gallery/blob/master/README.md#setup
		container.onclick = (event: MouseEvent) => {
			event = event || window.event
			const target = <HTMLImageElement>event.target || event.srcElement

			// <img> must be direct descendant of <a> element
			// need adjustment in case of pseudo elements on <a>
			if (target && target.src) {
				const link = target.src ? target.parentNode : target
				const options = {
					index: link,
					event
				}
				const links = container.querySelectorAll('a')

				// gallery initialization
				window.blueimp.Gallery(links, options)
			}
			return false
		}
	}
}