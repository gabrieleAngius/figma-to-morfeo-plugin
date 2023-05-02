import '@figma';
import { ActionTypes, PluginMessage } from '../_shared/types/actions';

type CustomMessageEventHandler = (pluginMessage: PluginMessage, props: OnMessageProperties) => void;

interface CustomUIAPI extends UIAPI {
  postMessage(pluginMessage: PluginMessage, options?: UIPostMessageOptions): void;
  onmessage: CustomMessageEventHandler | undefined;
  on(type: 'message', callback: CustomMessageEventHandler): void;
  once(type: 'message', callback: CustomMessageEventHandler): void;
  off(type: 'message', callback: CustomMessageEventHandler): void;
}

interface CustomPluginAPI extends PluginAPI {
  readonly ui: CustomUIAPI;
}

declare module '@figma/plugin-typings' {
  interface PluginAPI extends CustomPluginAPI {}
}
