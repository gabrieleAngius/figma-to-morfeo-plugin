import { PluginActionTypes, ActionTypes } from '../_shared/types/actions';
import { Resolver } from '../_shared/types/resolver';
import { colorNormalizer } from '../_shared/utils/normalizers';

export const controllers: Record<PluginActionTypes, Resolver> = {
  'generate-theme': () => {
    const localPaintStyles = figma.getLocalPaintStyles();
    const normalizedColors = colorNormalizer(localPaintStyles);

    figma.ui.postMessage({
      type: ActionTypes.downloadFile,
      meta: normalizedColors,
    });
  },

  'close-plugin': () => {
    figma.closePlugin();
  },
};
