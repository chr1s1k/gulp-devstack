export default function Lazyload(selector: string): void {
	if (window.MiniLazyload) {
		window.MiniLazyload(
			{
				rootMargin: '200px'
			},
			selector,
			window.MiniLazyload.IGNORE_NATIVE_LAZYLOAD
		)
	} else {
		console.error('Lazyloading is not working because dependent library is missing!')
	}
}