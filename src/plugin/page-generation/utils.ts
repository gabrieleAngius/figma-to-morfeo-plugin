import { PLUGIN_DATA_NAMESPACE, Slices } from '../../_shared/constants';

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

export type RefIds = Partial<Record<Slices, Record<string, string>>>;

export type GetVariantsParams = {
  sliceName: Slices;
  variants: { [key: string]: number };
  styleKey: keyof Pick<ComponentNode, 'cornerRadius' | 'strokeWeight'>;
}[];

type Variant = {
  name: string;
} & Record<keyof Pick<ComponentNode, 'cornerRadius' | 'strokeWeight'>, number>;

export const getVariantCombinations = (slices: GetVariantsParams): Variant[] => {
  const [first, ...rest] = slices;

  const combinations: Variant[] = Object.entries(first.variants).map(
    ([variantName, value]) =>
      ({
        name: `${first.sliceName}=${variantName}`,
        [first.styleKey]: value,
      } as Variant)
  );

  return rest.reduce((acc, { sliceName, variants, styleKey }) => {
    const newResult = [];

    for (const combination of acc) {
      for (const [variantName, value] of Object.entries(variants)) {
        const newObj = { ...combination };
        newObj.name = `${newObj.name}, ${sliceName}=${variantName}`;
        newObj[styleKey] = value;
        newResult.push(newObj);
      }
    }

    return newResult;
  }, combinations);
};

export const createInstances = (variants: Variant[]) => {
  let refIds: RefIds = {};

  const instances = variants.map((variant) => {
    const name = variant.name;
    const instance = figma.createComponent();

    instance.name = name;
    instance.cornerRadius = variant.cornerRadius;
    instance.strokeWeight = variant.strokeWeight;

    instance.fills = [{ type: 'SOLID', color: { r: 52 / 255, g: 161 / 255, b: 109 / 255 } }];
    instance.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
    instance.strokeAlign = 'CENTER';

    name.split(', ').forEach((slice) => {
      const [sliceName, variantName] = slice.split('=');
      refIds[sliceName] = {
        ...refIds[sliceName],
        [variantName]: refIds[sliceName]?.[variantName]
          ? (refIds[sliceName][variantName] as string).concat('/#/', instance.id)
          : instance.id,
      };
    });

    return instance;
  });

  return { instances, refIds };
};

interface GetNewFrameOptions {
  padding?: number;
  previousElement?: SceneNode;
}

export const getNewFrame = (name: string, options?: GetNewFrameOptions) => {
  const padding = options?.padding | 20;
  const previousElement = options?.previousElement;

  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = 'HORIZONTAL';
  frame.layoutAlign = 'STRETCH';
  frame.itemSpacing = padding;
  frame.paddingLeft = padding;
  frame.paddingRight = padding;
  frame.paddingTop = padding;
  frame.paddingBottom = padding;

  if (previousElement) {
    frame.y = previousElement.y + previousElement.height + 50;
  }

  return frame;
};

/**
 * Assign to each slice the matching
 * ref ids using setSharedPluginData
 */
export const setRefs = ({
  slices,
  refIds,
}: {
  slices: readonly SceneNode[] | DefaultShapeMixin[];
  refIds: RefIds[Slices];
}) => {
  slices.map((slice) => {
    if (refIds?.hasOwnProperty(slice.name)) {
      slice.setSharedPluginData(PLUGIN_DATA_NAMESPACE, slice.id, refIds[slice.name]);
    }
  });
};

/**
 * Takes the radiiFrame as parameter and sync
 * matching Box variants with current style settings
 *
 * It returns the existing and new variants added
 */
export const syncRadiiVariants = (radiiFrame: FrameNode) => {
  const newRadiusSlices: Record<string, number> = {};
  const existentRadiusSlices: Record<string, number> = {};

  radiiFrame.children.map((radiiSlice) => {
    if (radiiSlice.type !== 'RECTANGLE') {
      return;
    }

    const refIds = radiiSlice.getSharedPluginData(PLUGIN_DATA_NAMESPACE, radiiSlice.id).split('/#/');
    refIds.map((refId) => {
      const boxVariant = figma.getNodeById(refId);

      if (radiiSlice.cornerRadius === figma.mixed) {
        figma.notify('Mixed border radius is not allowed on Slices', { error: true });
        return;
      }

      if (!boxVariant && existentRadiusSlices[radiiSlice.name]) {
        figma.notify(`The ${radiiSlice.name} variant on Radii already exist, please use a unique name`, {
          error: true,
          timeout: 2000,
        });
        return;
      }

      if (!boxVariant) {
        newRadiusSlices[radiiSlice.name] = radiiSlice.cornerRadius;
        return;
      }

      if (boxVariant.type === 'COMPONENT') {
        existentRadiusSlices[radiiSlice.name] = radiiSlice.cornerRadius;
        boxVariant.cornerRadius = radiiSlice.cornerRadius;
        boxVariant.name = boxVariant.name.replace(/Radius=.*?,/, `${Slices.Radius}=${radiiSlice.name},`);
      }
    });
  });

  return { existentRadiusSlices, newRadiusSlices };
};

/**
 * Takes the borderWidthsFrame as parameter and sync
 * matching Box variants with current style settings
 *
 * It returns the existing and new variants added
 */
export const syncBorderWidthVariants = (borderWidthsFrame: FrameNode) => {
  const newBorderWidthSlices: Record<string, number> = {};
  const existentBorderWidthSlices: Record<string, number> = {};

  borderWidthsFrame.children.map((borderWidthSlice) => {
    if (borderWidthSlice.type !== 'LINE') {
      return;
    }

    if (borderWidthSlice.strokeWeight === figma.mixed) {
      return;
    }
    const strokeWeight = borderWidthSlice.strokeWeight;

    const refIds = borderWidthSlice.getSharedPluginData(PLUGIN_DATA_NAMESPACE, borderWidthSlice.id).split('/#/');
    refIds.map((refId) => {
      const boxVariant = figma.getNodeById(refId);

      if (!boxVariant && existentBorderWidthSlices[borderWidthSlice.name]) {
        figma.notify(`The ${borderWidthSlice.name} variant on Border widths already exist, please use a unique name`, {
          error: true,
          timeout: 2000,
        });
        return;
      }

      if (!boxVariant) {
        newBorderWidthSlices[borderWidthSlice.name] = strokeWeight;
        return;
      }

      if (boxVariant.type === 'COMPONENT') {
        existentBorderWidthSlices[borderWidthSlice.name] = strokeWeight;
        boxVariant.strokeWeight = borderWidthSlice.strokeWeight;
        boxVariant.name = boxVariant.name.replace(
          /Border width=.*?,/,
          `${Slices.BorderWidth}=${borderWidthSlice.name},`
        );
      }
    });
  });

  return { existentBorderWidthSlices, newBorderWidthSlices };
};
