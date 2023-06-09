/** It contains all the possible values for message' type */
export enum ActionTypes {
  generateTheme = 'generate-theme',
  closePlugin = 'close-plugin',
  downloadFile = 'download-file',
  createMorfeoTheme = 'create-morfeo-theme',
  syncTheme = 'sync-theme',
}

/** Subset of ActionTypes which includes just what could be received and managed on plugin' controller */
export type PluginActionTypes = Exclude<ActionTypes, ActionTypes.downloadFile>;

export interface PluginMessage {
  type: ActionTypes;
  meta?: unknown;
}
