import { recursiveMixColors, toRgbaString } from './mixColors';

export const colorNormalizer = (figmaPaintStyles: PaintStyle[]) => {
  return figmaPaintStyles.reduce<Record<string, string>>((acc, current) => {
    const newPaint = paintNormalizer(current.paints, current.name);
    if (newPaint) {
      return { ...acc, ...newPaint };
    }
    return acc;
  }, {});
};

const isSolid = (paint: Paint): paint is SolidPaint => (paint as SolidPaint).type === 'SOLID';

/** Convert a color which is in scale from 0-1 to a scale 0-255 */
const to255Scale = (color: number) => Math.round(color * 255);

const paintsToRgba = (paints: readonly SolidPaint[]): RGBA[] => {
  return paints.map((paint) => {
    const { color, opacity = 1 } = paint;
    return {
      r: to255Scale(color.r),
      g: to255Scale(color.g),
      b: to255Scale(color.b),
      a: opacity,
    };
  });
};

const paintNormalizer = (paints: readonly Paint[], name: string) => {
  if (!paints.every(isSolid)) {
    return; // NON-solid colours are ignored for the moment
  }

  const rgbaColors = paintsToRgba(paints);

  if (paints.length > 1) {
    const mixedColor = recursiveMixColors(rgbaColors);
    return { [name]: mixedColor };
  }

  const css = toRgbaString(rgbaColors[0]);
  return { [name]: css };
};
