import { PLUGIN_DATA_NAMESPACE, Slices } from '../../_shared/constants';
import { updateVariantName } from '../utils/utils';

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
    const cornerRadius = radiiSlice.cornerRadius;
    const refIds = radiiSlice.getSharedPluginData(PLUGIN_DATA_NAMESPACE, radiiSlice.id).split('/#/');

    if (cornerRadius === figma.mixed) {
      figma.notify('Mixed border radius is not allowed on Slices', { error: true });
      return;
    }

    if (refIds[0] === '') {
      newRadiusSlices[radiiSlice.name] = cornerRadius;
      return;
    }

    refIds.map((refId) => {
      const boxVariant = figma.getNodeById(refId);

      if (!boxVariant && existentRadiusSlices[radiiSlice.name]) {
        figma.notify(`The ${radiiSlice.name} variant on Radii already exist, please use a unique name`, {
          error: true,
          timeout: 2000,
        });
        return;
      }

      if (!boxVariant) {
        // if reach here means the box variant with this id: refId does not exist anymore (has been deleted)
        return;
      }

      if (boxVariant.type === 'COMPONENT') {
        existentRadiusSlices[radiiSlice.name] = cornerRadius;
        boxVariant.cornerRadius = radiiSlice.cornerRadius;
        boxVariant.name = updateVariantName({
          instanceName: boxVariant.name,
          newVariantName: radiiSlice.name,
          sliceName: Slices.Radius,
        });
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
        boxVariant.name = updateVariantName({
          instanceName: boxVariant.name,
          newVariantName: borderWidthSlice.name,
          sliceName: Slices.BorderWidth,
        });
      }
    });
  });

  return { existentBorderWidthSlices, newBorderWidthSlices };
};
