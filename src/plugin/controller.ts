import { PluginActionTypes, ActionTypes } from '../_shared/types/actions';
import { Controller } from '../_shared/types/contoller';
import { generateTheme } from './generateTheme/generateTheme';
import { syncTheme } from './syncTheme/syncTheme';
import { createMorfeoTheme } from './createMorfeoTheme/createMorfeoTheme';
import { closePlugin } from './closePlugin/closePlugin';

export const controllers: Record<PluginActionTypes, Controller> = {
  [ActionTypes.generateTheme]: generateTheme,
  [ActionTypes.syncTheme]: syncTheme,
  [ActionTypes.createMorfeoTheme]: createMorfeoTheme,
  [ActionTypes.closePlugin]: closePlugin,
};

figma.showUI(__html__);

figma.ui.onmessage = (msg) => {
  controllers[msg.type](msg);
};
