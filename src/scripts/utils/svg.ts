export const createSvg = (
  icon: string,
  width: number,
  height: number,
  className = '',
): SVGSVGElement => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

  svg.classList && svg.classList.add('icon')
  className && svg.classList && svg.classList.add(className)
  svg.setAttribute('width', width.toString())
  svg.setAttribute('height', height.toString())
  svg.setAttribute('aria-hidden', 'true')

  const useEl = document.createElementNS('http://www.w3.org/2000/svg', 'use')
  useEl.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#${icon}`)

  svg.appendChild(useEl)

  return svg
}
