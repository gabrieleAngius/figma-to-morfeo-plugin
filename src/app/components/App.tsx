import * as React from 'react';
import { useDownload } from '../hooks/useDownload';
import '../styles/ui.css';
import { ActionTypes } from '../../_shared/types/actions';

declare function require(_: string): any;

const App = ({}) => {
  const onGenerate = () => {
    parent.postMessage({ pluginMessage: { type: ActionTypes.generateTheme } }, '*');
  };

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: ActionTypes.closePlugin } }, '*');
  };

  const { Download, downloadFile } = useDownload();

  React.useEffect(() => {
    window.onmessage = (event) => {
      const { type, meta } = event.data.pluginMessage;
      if (type === ActionTypes.downloadFile) {
        downloadFile(new File([JSON.stringify(meta, null, 2)], 'theme.json'));
      }
    };
  }, []);

  return (
    <div>
      <img src={require('../assets/logo.svg')} />
      <h2>Morfeo Plugin</h2>
      <button id="generate" onClick={onGenerate}>
        Generate theme
      </button>
      <Download />
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default App;
