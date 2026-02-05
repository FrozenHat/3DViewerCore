import { Viewer } from './core/viewer';
import { Controls } from './interactions/controls';
import { PartSelection } from './interactions/partSelection';
import { CameraFocus } from './interactions/cameraFocus';
import { AnimationLoader } from './loaders/animationLoader';
import { AnimationPanel } from './ui/animationPanel';
import { Timeline } from './ui/timeline';
import { DetailCard } from './ui/detailCard';
import { LightingManager } from './utils/lightingManager';

// Экспорт типов
export * from './types';

// Экспорт конфигов
export { defaultConfig } from './config/defaultConfig';
export { 
    studioPreset, 
    outdoorPreset, 
    darkPreset, 
    minimalPreset 
} from './config/presets';

// Экспорт функций автоинициализации
export { initFromConfig, initFromElement, autoInit } from './autoInit';

// Экспорт классов
export {
    Viewer,
    Controls,
    PartSelection,
    CameraFocus,
    AnimationLoader,
    AnimationPanel,
    Timeline,
    DetailCard,
    LightingManager
};

// Импортируем пресеты
import { defaultConfig } from './config/defaultConfig';
import { studioPreset, outdoorPreset, darkPreset, minimalPreset } from './config/presets';
import { initFromConfig, initFromElement, autoInit } from './autoInit';

// Глобальный объект для браузера
const ViewerLib = {
    Viewer,
    Controls,
    PartSelection,
    CameraFocus,
    AnimationLoader,
    AnimationPanel,
    Timeline,
    DetailCard,
    LightingManager,
    defaultConfig,
    studioPreset,
    outdoorPreset,
    darkPreset,
    minimalPreset,
    initFromConfig,
    initFromElement,
    autoInit
};

// @ts-ignore
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.Viewer = Viewer;
    // @ts-ignore
    window.ViewerLib = ViewerLib;
    
    console.log('✅ ViewerLib экспортирован в window:', Object.keys(ViewerLib));
}

export default ViewerLib;