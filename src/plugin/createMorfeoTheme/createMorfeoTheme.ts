import {
  THEME_PAGE_NAME,
  SliceFrameNames,
  Slices,
  PLUGIN_DATA_NAMESPACE,
  PluginDataKeys,
} from '../../_shared/constants';
import { Controller } from '../../_shared/types/contoller';
import { createBorderWidthSlices, createRadiiSlices } from '../generateTheme/utils';
import { getNewFrame, getVariantCombinations, createInstances, setRefs, saveCurrentBoxVariants } from '../utils/utils';

export const createMorfeoTheme: Controller = () => {
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
  saveCurrentBoxVariants({
    themePage: page,
    refIds: boxVariants.refIds[Slices.Radius],
    pluginKey: PluginDataKeys.currentRadiiVariants,
  });
  saveCurrentBoxVariants({
    themePage: page,
    refIds: boxVariants.refIds[Slices.BorderWidth],
    pluginKey: PluginDataKeys.currentBorderWidthVariants,
  });

  box.resize(140, 140);
  boxComponent.clipsContent = false;
  box.clipsContent = false;
  boxComponent.name = 'Box';
  page.setSharedPluginData(PLUGIN_DATA_NAMESPACE, PluginDataKeys.boxRefId, boxComponent.id);
  box.locked = true;

  figma.notify('Theme page created!');
  figma.closePlugin();
};
