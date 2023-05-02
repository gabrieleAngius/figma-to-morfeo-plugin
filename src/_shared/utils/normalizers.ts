export const colorNormalizer = (figmaPaintStyles: PaintStyle[]) => {
    return figmaPaintStyles.reduce<Record<string, string>>((acc, current) => {
        const newPaint = paintNormalizer(current.paints, current.name);
        if (newPaint) {
            return {...acc, ...newPaint};
        }
        return acc;
    }, {});
};

const isSolid = (paint: Paint): paint is SolidPaint => (paint as SolidPaint).type === 'SOLID';

const toCss = (color: RGB, opacity = 1) => `rgba(${color.r},${color.g},${color.b},${opacity})`;

const paintNormalizer = (paints: readonly Paint[], name: string) => {
    if (isSolid(paints[0])) {
        const css = toCss(paints[0].color, paints[0].opacity);
        return {[name]: css};
    }

    return undefined;
};
