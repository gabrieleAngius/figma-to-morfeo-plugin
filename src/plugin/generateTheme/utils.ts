export const createRadiiSlices = (variants: Record<string, number>) => {
  return Object.entries(variants).map(([name, value]) => {
    const rect = figma.createRectangle();
    rect.name = name;
    rect.cornerRadius = value;
    rect.layoutAlign = 'STRETCH';
    rect.layoutPositioning = 'AUTO';
    return rect;
  });
};

export const createBorderWidthSlices = (variants: Record<string, number>) => {
  return Object.entries(variants).map(([name, value]) => {
    const line = figma.createLine();
    line.name = name;
    line.strokeWeight = value;
    line.layoutAlign = 'STRETCH';
    line.layoutPositioning = 'AUTO';
    return line;
  });
};
