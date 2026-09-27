/**
 * Generate a placeholder SVG data URL for demo images.
 *
 * @param label  - Text shown in the center of the placeholder
 * @param fill   - Background color (hex)
 * @param textFill - Text color (hex)
 * @param opts   - Optional width/height/fontSize overrides
 */
export function makePlaceholder(
  label: string,
  fill: string,
  textFill: string,
  opts?: { width?: number; height?: number; fontSize?: number },
) {
  const w = opts?.width ?? 1000;
  const h = opts?.height ?? 800;
  const fs = opts?.fontSize ?? 28;
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${fill}"/><text x="${w / 2}" y="${h / 2}" text-anchor="middle" fill="${textFill}" font-size="${fs}" font-family="sans-serif">${label}</text></svg>`,
  )}`;
}
