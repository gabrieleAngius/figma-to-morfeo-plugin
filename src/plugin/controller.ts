import { controllers } from './pluginControllers';

figma.showUI(__html__);

figma.ui.onmessage = (msg) => {
  controllers[msg.type](msg);
};
