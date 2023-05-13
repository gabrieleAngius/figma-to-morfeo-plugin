import { PLUGIN_DATA_NAMESPACE, Slices } from '../../_shared/constants';

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

export const updateVariantName = ({
  instanceName,
  newVariantName,
  sliceName,
}: {
  instanceName: string;
  newVariantName: string;
  sliceName: Slices;
}) => {
  const regex = new RegExp(`${sliceName}=[^,]+`, 'i');
  const newSlice = `${sliceName}=${newVariantName}`;
  const updatedName = instanceName.slice().replace(regex, newSlice);
  return updatedName;
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
  slices.map((slice: SceneNode | DefaultShapeMixin) => {
    if (refIds?.hasOwnProperty(slice.name)) {
      slice.setSharedPluginData(PLUGIN_DATA_NAMESPACE, slice.id, refIds[slice.name]);
    }
  });
};
