import { ActionTypes } from '../_shared/types/actions';
import { colorNormalizer } from '../_shared/utils/normalizers';

figma.showUI(__html__);

figma.ui.onmessage = (msg) => {
  if (msg.type === ActionTypes.generateTheme) {
    const localPaintStyles = figma.getLocalPaintStyles();
    const normalizedColors = colorNormalizer(localPaintStyles);

    // This is how figma responds back to the ui
    figma.ui.postMessage({
      type: ActionTypes.downloadFile,
      meta: normalizedColors,
    });
  }

  if (msg.type === ActionTypes.closePlugin) {
    figma.closePlugin();
  }
};
