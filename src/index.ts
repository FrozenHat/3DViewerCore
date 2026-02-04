import { Viewer } from './core/viewer';
import { EmbedAPI } from './api/embedAPI';
import { ModelLoader } from './loaders/modelLoader';
import './styles/viewer.css';

const ViewerLib = {
  Viewer,
  EmbedAPI,
  ModelLoader
};

export default ViewerLib;
export { Viewer, EmbedAPI, ModelLoader };

// Экспортируем в глобальное окно
declare global {
  interface Window {
    Viewer: typeof Viewer;
  }
}

if (typeof window !== 'undefined') {
  window.Viewer = Viewer;
}