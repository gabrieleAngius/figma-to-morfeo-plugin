export enum ActionTypes {
  generateTheme = 'generate-theme',
  closePlugin = 'close-plugin',
  downloadFile = 'download-file',
}

export interface PluginMessage {
  type: ActionTypes;
  meta?: unknown;
}
