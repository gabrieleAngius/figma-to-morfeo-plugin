import { PLUGIN_DATA_NAMESPACE, PluginDataKeys, Slices } from '../../_shared/constants';
import { deleteNodesById, updateVariantName } from '../utils/utils';

/**
 * Takes the radiiFrame as parameter and sync
 * matching Box variants with current style settings
 *
 * It returns the existing and new variants added
 */
export const syncRadiiVariants = (radiiFrame: FrameNode, errorMap: ErrorMap) => {
  const newRadiusSlices: Record<string, number> = {};
  const existentRadiusSlices: Record<string, number> = {};
  const acceptedElementType: SceneNode['type'] = 'RECTANGLE';

  radiiFrame.children.map((radiiSlice) => {
    if (radiiSlice.type !== acceptedElementType) {
      generateAndRecordErrorMessage({
        errorMap,
        errorType: ErrorType.WRONG_ELEMENT_TYPE,
        values: {
          acceptedElementType,
          currentType: radiiSlice.type,
          sliceName: Slices.Radius,
        },
      });
      return;
    }

    const cornerRadius = radiiSlice.cornerRadius;
    const refIds = radiiSlice.getSharedPluginData(PLUGIN_DATA_NAMESPACE, radiiSlice.id).split('/#/');

    if (cornerRadius === figma.mixed) {
      generateAndRecordErrorMessage({
        errorType: ErrorType.MIXED_SLICE_VALUES,
        errorMap,
        values: { sliceName: Slices.Radius, variantName: radiiSlice.name },
      });
      return;
    }

    if (existentRadiusSlices[radiiSlice.name]) {
      generateAndRecordErrorMessage({
        errorType: ErrorType.DUPLICATED_SLICE_NAME,
        errorMap,
        values: { sliceName: Slices.Radius, variantName: radiiSlice.name },
      });
      return;
    }

    if (refIds[0] === '') {
      newRadiusSlices[radiiSlice.name] = cornerRadius;
      return;
    }

    refIds.map((refId) => {
      const boxVariant = figma.getNodeById(refId);

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
export const syncBorderWidthVariants = (borderWidthsFrame: FrameNode, errorMap: ErrorMap) => {
  const newBorderWidthSlices: Record<string, number> = {};
  const existentBorderWidthSlices: Record<string, number> = {};

  const acceptedElementType: SceneNode['type'] = 'LINE';
  borderWidthsFrame.children.map((borderWidthSlice) => {
    if (borderWidthSlice.type !== acceptedElementType) {
      generateAndRecordErrorMessage({
        errorMap,
        errorType: ErrorType.WRONG_ELEMENT_TYPE,
        values: {
          acceptedElementType,
          currentType: borderWidthSlice.type,
          sliceName: Slices.BorderWidth,
        },
      });
      return;
    }

    if (borderWidthSlice.strokeWeight === figma.mixed) {
      generateAndRecordErrorMessage({
        errorMap,
        errorType: ErrorType.MIXED_SLICE_VALUES,
        values: {
          sliceName: Slices.BorderWidth,
          variantName: borderWidthSlice.name,
        },
      });
      return;
    }
    const strokeWeight = borderWidthSlice.strokeWeight;
    const refIds = borderWidthSlice.getSharedPluginData(PLUGIN_DATA_NAMESPACE, borderWidthSlice.id).split('/#/');

    if (existentBorderWidthSlices[borderWidthSlice.name]) {
      generateAndRecordErrorMessage({
        errorMap,
        errorType: ErrorType.DUPLICATED_SLICE_NAME,
        values: {
          sliceName: Slices.BorderWidth,
          variantName: borderWidthSlice.name,
        },
      });

      return;
    }

    if (refIds[0] === '') {
      newBorderWidthSlices[borderWidthSlice.name] = strokeWeight;
      return;
    }

    refIds.map((refId) => {
      const boxVariant = figma.getNodeById(refId);

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

type CheckAndRemoveDeletedSlicesOptions = {
  themePage: PageNode;
  existentSlicesKeys: string[];
  pluginDataKey: Extract<
    PluginDataKeys,
    PluginDataKeys.currentRadiiVariants | PluginDataKeys.currentBorderWidthVariants
  >;
};

/**
 * It deletes all box instances related to a slice variant
 * if the user removed it, and returns updated refs
 */
export const checkAndRemoveDeletedSlices = ({
  themePage,
  existentSlicesKeys,
  pluginDataKey,
}: CheckAndRemoveDeletedSlicesOptions) => {
  const unparsedCurrentVariants = themePage.getSharedPluginData(PLUGIN_DATA_NAMESPACE, pluginDataKey);
  if (unparsedCurrentVariants === '') {
    return {};
  }
  const currentVariants = JSON.parse(unparsedCurrentVariants) as Record<string, string>;

  const updatedCurrentVariants = Object.entries(currentVariants).reduce<Record<string, string>>((acc, [name, ids]) => {
    if (!existentSlicesKeys.includes(name)) {
      deleteNodesById(ids.split('/#/'));
      return acc;
    }

    return { ...acc, [name]: ids };
  }, {});

  return updatedCurrentVariants;
};

export enum ErrorType {
  WRONG_ELEMENT_TYPE = 'wrongElementType',
  MIXED_SLICE_VALUES = 'mixedSliceValues',
  DUPLICATED_SLICE_NAME = 'duplicatedSliceName',
}

export type ErrorMap = Record<ErrorType, string[]>;

/**
 * Notify the user of each error found stored in the errorMap
 *
 * @param errorMap - Object containing the error types and their messages
 */
export const notifyErrorMessages = (errorMap: ErrorMap) => {
  console.log(Object.values(errorMap));
  Object.values(errorMap)
    .flat()
    .forEach((errorMessage) => {
      figma.notify(`⚠️ Warning: ${errorMessage}`, { timeout: 4000 });
    });
};

function createWrongElementMessage({
  acceptedElementType,
  currentType,
  sliceName,
}: {
  acceptedElementType: string;
  currentType: string;
  sliceName: string;
}) {
  return `The ${sliceName} slice accepts only ${acceptedElementType} elements, you're also using ${currentType}`;
}

function createDuplicatedSliceNameMessage({ variantName, sliceName }: { variantName: string; sliceName: string }) {
  return `The ${variantName} variant on ${sliceName} already exist, please use a unique name`;
}

function createMixedSliceValuesMessage({ variantName, sliceName }: { variantName: string; sliceName: string }) {
  return `You're using mixed ${sliceName} in ${variantName}. Please use a single value`;
}

const warningMessageGenerators = {
  [ErrorType.WRONG_ELEMENT_TYPE]: createWrongElementMessage,
  [ErrorType.DUPLICATED_SLICE_NAME]: createDuplicatedSliceNameMessage,
  [ErrorType.MIXED_SLICE_VALUES]: createMixedSliceValuesMessage,
};

export function generateAndRecordErrorMessage<T extends ErrorType>({
  errorType,
  errorMap,
  values,
}: {
  errorType: T;
  errorMap: ErrorMap;
  values: Parameters<typeof warningMessageGenerators[T]>[0];
}) {
  const selectedMessage = warningMessageGenerators[errorType](values as any);
  errorMap[errorType].push(selectedMessage);
}
