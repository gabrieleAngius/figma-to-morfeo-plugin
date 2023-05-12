import { PluginActionTypes, ActionTypes } from '../_shared/types/actions';
import { PLUGIN_DATA_NAMESPACE, PluginDataKeys, SliceFrameNames, Slices, THEME_PAGE_NAME } from '../_shared/constants';
import { Resolver } from '../_shared/types/resolver';
import { colorNormalizer } from '../_shared/utils/normalizers';
import {
  createBorderWidthSlices,
  createInstances,
  createRadiiSlices,
  getNewFrame,
  getVariantCombinations,
  setRefs,
  syncBorderWidthVariants,
  syncRadiiVariants,
} from './page-generation/utils';

export const controllers: Record<PluginActionTypes, Resolver> = {
  'generate-theme': () => {
    const localPaintStyles = figma.getLocalPaintStyles();
    const normalizedColors = colorNormalizer(localPaintStyles);

    figma.ui.postMessage({
      type: ActionTypes.downloadFile,
      meta: normalizedColors,
    });
  },

  'sync-theme': () => {
    const themePage = figma.root.children.find((node) => node.name === THEME_PAGE_NAME);
    if (!themePage) {
      figma.notify(
        `Cannot find a '${THEME_PAGE_NAME}' page. Please use 'Create theme page' function of the plugin before sync`,
        { error: true, timeout: 5000 }
      );
      return;
    }

    const radiiFrame = themePage.findOne(
      (node) => node.name === SliceFrameNames.Radius && node.type === 'FRAME'
    ) as FrameNode;
    const borderWidthsFrame = themePage.findOne(
      (node) => node.name === SliceFrameNames.BorderWidth && node.type === 'FRAME'
    ) as FrameNode;
    const boxComponentId = themePage.getSharedPluginData(PLUGIN_DATA_NAMESPACE, PluginDataKeys.boxRefId);
    const boxComponent = figma.getNodeById(boxComponentId);

    if (!boxComponent || boxComponent.type !== 'COMPONENT_SET') {
      figma.notify('Cant find the BOX primitive component', { error: true });
      return;
    }

    const { existentRadiusSlices, newRadiusSlices } = syncRadiiVariants(radiiFrame);
    const { existentBorderWidthSlices, newBorderWidthSlices } = syncBorderWidthVariants(borderWidthsFrame);

    const newRadiiCombinations = getVariantCombinations([
      { sliceName: Slices.Radius, styleKey: 'cornerRadius', variants: newRadiusSlices },
      {
        sliceName: Slices.BorderWidth,
        styleKey: 'strokeWeight',
        variants: existentBorderWidthSlices,
      },
    ]);

    const newBorderWithCombinations = getVariantCombinations([
      { sliceName: Slices.Radius, styleKey: 'cornerRadius', variants: { ...existentRadiusSlices, ...newRadiusSlices } },
      {
        sliceName: Slices.BorderWidth,
        styleKey: 'strokeWeight',
        variants: newBorderWidthSlices,
      },
    ]);

    const newBoxVariants = createInstances([...newRadiiCombinations, ...newBorderWithCombinations]);

    // add the new variants to the Box component
    newBoxVariants.instances.map((newBoxVariant) => boxComponent.appendChild(newBoxVariant));

    setRefs({ refIds: newBoxVariants.refIds?.[Slices.Radius], slices: radiiFrame.children });
    setRefs({ refIds: newBoxVariants.refIds?.[Slices.BorderWidth], slices: borderWidthsFrame.children });

    figma.notify('Components updated!');
  },

  'generate-theme-page': () => {
    const themePage = figma.root.children.find((node) => node.name === THEME_PAGE_NAME);
    if (themePage) {
      figma.notify(`The '${THEME_PAGE_NAME}' page already exist`, { error: true, timeout: 5000 });
      return;
    }

    const page = figma.createPage();
    page.name = THEME_PAGE_NAME;
    figma.currentPage = page;

    const radiiSlices = createRadiiSlices({ S: 3, M: 6, L: 10 });
    const radiiFrame = getNewFrame(SliceFrameNames.Radius);
    radiiSlices.map((radiiSlice) => radiiFrame.appendChild(radiiSlice));
    radiiFrame.resize(380, 140);

    const borderWidthSlices = createBorderWidthSlices({ none: 0, XS: 0.5, S: 1, M: 2, L: 3 });
    const borderWidthFrame = getNewFrame(SliceFrameNames.BorderWidth, { previousElement: radiiFrame });
    borderWidthSlices.map((borderWidthSlice) => borderWidthFrame.appendChild(borderWidthSlice));
    borderWidthFrame.resize(620, 140);

    const box = getNewFrame('Box', { previousElement: borderWidthFrame });

    const combinations = getVariantCombinations([
      { sliceName: Slices.Radius, styleKey: 'cornerRadius', variants: { S: 3, M: 6, L: 10 } },
      {
        sliceName: Slices.BorderWidth,
        styleKey: 'strokeWeight',
        variants: { none: 0, XS: 0.5, S: 1, M: 2, L: 3 },
      },
    ]);
    const boxVariants = createInstances(combinations);
    const boxComponent = figma.combineAsVariants(boxVariants.instances, box);

    // set the ref ids
    setRefs({ refIds: boxVariants.refIds[Slices.Radius], slices: radiiSlices });
    setRefs({ refIds: boxVariants.refIds[Slices.BorderWidth], slices: borderWidthSlices });

    box.resize(140, 140);
    boxComponent.clipsContent = false;
    box.clipsContent = false;
    boxComponent.name = 'Box';
    page.setSharedPluginData(PLUGIN_DATA_NAMESPACE, PluginDataKeys.boxRefId, boxComponent.id);
    box.locked = true;

    figma.notify('Theme page created!');
    figma.closePlugin();
  },

  'close-plugin': () => {
    figma.closePlugin();
  },
};
