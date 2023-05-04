import { mix } from 'polished';
import { parseToRgb } from 'polished';

export const toRgbString = (col: RGBA) => `rgb(${col.r},${col.g},${col.b})`;
export const toRgbaString = (col: RGBA) => `rgba(${col.r},${col.g},${col.b},${col.a})`;

export const recursiveMixColors = (colors: RGBA[]) => {
  const mixed = mixColors(colors[0], colors[1]);
  if (colors.length > 2) {
    const rgb = parseToRgb(mixed);
    const parsed = { r: rgb.red, g: rgb.green, b: rgb.blue, a: 'alpha' in rgb ? rgb.alpha : 1 };

    const rest = colors.slice(2);

    return recursiveMixColors([parsed, ...rest]);
  }

  return mixed;
};

export const mixColors = (color1: RGBA, color2: RGBA) => {
  const mixedColor = mix(color2.a, toRgbString(color2), toRgbaString(color1));
  return mixedColor;
};
