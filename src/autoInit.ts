import { Viewer } from './core/viewer';
import { defaultConfig } from './config/defaultConfig';
import { studioPreset, outdoorPreset, darkPreset, minimalPreset } from './config/presets';
import { ViewerConfig } from './types';

/**
 * Интерфейс для JSON-конфигурации
 */
interface ViewerConfigJSON {
    containerId: string;
    modelUrl?: string;
    preset?: PresetType;
    enableSelection?: boolean;
    enableUI?: boolean;
    panelType?: 'standard' | 'changed' | 'custom';
    customCssClass?: string;
    hdri?: {
        enabled?: boolean;
        url?: string;
        intensity?: number;
        background?: boolean;
    };
    animations?: {
        autoPlay?: boolean;
        pauseOnFocus?: boolean;
    };
    customLighting?: any;
    customCamera?: any;
    customRenderer?: any;
}

/**
 * Допустимые типы пресетов
 */
type PresetType = 'default' | 'studio' | 'outdoor' | 'dark' | 'minimal';

/**
 * Получить конфигурацию по имени пресета
 * @param presetName - Имя пресета
 * @returns Конфигурация viewer
 */
function getPresetConfig(presetName?: PresetType): Partial<ViewerConfig> {
    switch(presetName) {
        case 'studio':
            console.log('🎨 Применён пресет: Studio');
            return { ...studioPreset };
        case 'outdoor':
            console.log('🎨 Применён пресет: Outdoor');
            return { ...outdoorPreset };
        case 'dark':
            console.log('🎨 Применён пресет: Dark');
            return { ...darkPreset };
        case 'minimal':
            console.log('🎨 Применён пресет: Minimal');
            return { ...minimalPreset };
        default:
            console.log('🎨 Применён пресет: Default');
            return { ...defaultConfig };
    }
}

/**
 * Автоматическая инициализация viewer из JSON-конфига
 * 
 * @param configUrl - URL к JSON-файлу конфигурации
 * @returns Promise с экземпляром Viewer
 * 
 * @example
 * ```javascript
 * // В HTML
 * <script src="./bundle.js"></script>
 * <script>
 *   ViewerLib.initFromConfig('./viewer-config.json');
 * </script>
 * ```
 * 
 * @example
 * ```json
 * // viewer-config.json
 * {
 *   "containerId": "my-viewer",
 *   "modelUrl": "./models/engine.glb",
 *   "preset": "studio",
 *   "enableSelection": true,
 *   "enableUI": true
 * }
 * ```
 */
export async function initFromConfig(configUrl: string): Promise<Viewer | null> {
    try {
        console.log(`📋 Загрузка конфигурации из ${configUrl}...`);
        
        // Загружаем конфиг
        const response = await fetch(configUrl);
        if (!response.ok) {
            throw new Error(`Не удалось загрузить конфиг: ${response.statusText}`);
        }
        
        const config: ViewerConfigJSON = await response.json();
        console.log('✅ Конфигурация загружена:', config);
        
        // Выбираем базовый пресет используя общую функцию
        const viewerConfig = getPresetConfig(config.preset);
        
        // Применяем кастомные настройки из конфига
        if (config.enableSelection !== undefined) {
            viewerConfig.enableSelection = config.enableSelection;
        }
        
        if (config.enableUI !== undefined) {
            viewerConfig.enableUI = config.enableUI;
        }
        
        if (config.panelType !== undefined) {
            viewerConfig.panelType = config.panelType;
        }
        
        if (config.customCssClass !== undefined) {
            viewerConfig.customCssClass = config.customCssClass;
        }
        
        if (config.hdri !== undefined) {
            viewerConfig.hdri = {
                ...viewerConfig.hdri,
                ...config.hdri
            };
            console.log('🌅 Применены кастомные настройки HDRI');
        }
        
        if (config.animations !== undefined) {
            viewerConfig.animations = {
                ...viewerConfig.animations,
                ...config.animations
            };
            console.log('🎬 Применены кастомные настройки анимаций');
        }
        
        if (config.customLighting) {
            viewerConfig.lighting = {
                ...viewerConfig.lighting,
                ...config.customLighting
            };
            console.log('💡 Применены кастомные настройки освещения');
        }
        
        if (config.customCamera) {
            viewerConfig.camera = {
                ...viewerConfig.camera,
                ...config.customCamera
            };
            console.log('📷 Применены кастомные настройки камеры');
        }
        
        if (config.customRenderer) {
            viewerConfig.renderer = {
                ...viewerConfig.renderer,
                ...config.customRenderer
            };
            console.log('🎬 Применены кастомные настройки рендерера');
        }
        
        // Создаём viewer
        console.log(`🚀 Создание viewer в контейнере #${config.containerId}...`);
        const viewer = new Viewer(config.containerId, viewerConfig);
        
        // Инициализируем
        viewer.init();
        console.log('✅ Viewer инициализирован');
        
        // Загружаем модель, если указана
        if (config.modelUrl) {
            console.log(`📦 Загрузка модели: ${config.modelUrl}...`);
            viewer.loadModel(config.modelUrl);
        }
        
        // Запускаем рендеринг
        viewer.render();
        console.log('🎬 Рендеринг запущен');
        
        return viewer;
        
    } catch (error) {
        console.error('❌ Ошибка инициализации из конфига:', error);
        return null;
    }
}

/**
 * Автоматическая инициализация из data-атрибутов HTML-элемента
 * 
 * @param containerId - ID контейнера
 * @returns Promise с экземпляром Viewer
 * 
 * @example
 * ```html
 * <div id="viewer" 
 *      data-model="./models/engine.glb"
 *      data-preset="studio"
 *      data-enable-selection="true"
 *      data-enable-ui="true">
 * </div>
 * 
 * <script>
 *   ViewerLib.initFromElement('viewer');
 * </script>
 * ```
 */
export async function initFromElement(containerId: string): Promise<Viewer | null> {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Контейнер #${containerId} не найден`);
        }
        
        console.log(`📋 Чтение конфигурации из data-атрибутов #${containerId}...`);
        
        // Читаем data-атрибуты
        const dataset = container.dataset;
        
        const config: ViewerConfigJSON = {
            containerId,
            modelUrl: dataset.model,
            preset: (dataset.preset as PresetType) || 'default',
            enableSelection: dataset.enableSelection === 'true',
            enableUI: dataset.enableUi === 'true',
            panelType: (dataset.panelType as 'standard' | 'changed' | 'custom') || 'standard',
            customCssClass: dataset.customCssClass || ''
        };
        
        console.log('✅ Конфигурация из data-атрибутов:', config);
        
        // Используем общую функцию для выбора пресета
        const viewerConfig = getPresetConfig(config.preset);
        
        viewerConfig.enableSelection = config.enableSelection;
        viewerConfig.enableUI = config.enableUI;
        viewerConfig.panelType = config.panelType;
        viewerConfig.customCssClass = config.customCssClass;
        
        const viewer = new Viewer(containerId, viewerConfig);
        viewer.init();
        
        if (config.modelUrl) {
            viewer.loadModel(config.modelUrl);
        }
        
        viewer.render();
        
        return viewer;
        
    } catch (error) {
        console.error('❌ Ошибка инициализации из элемента:', error);
        return null;
    }
}

/**
 * Автопоиск и инициализация всех элементов с data-viewer атрибутом
 * 
 * @example
 * ```html
 * <div class="viewer" 
 *      data-viewer
 *      data-model="./models/engine.glb"
 *      data-preset="studio">
 * </div>
 * 
 * <script>
 *   // Автоматически найдёт и инициализирует все [data-viewer]
 *   ViewerLib.autoInit();
 * </script>
 * ```
 */
export async function autoInit(): Promise<Viewer[]> {
    const viewers: Viewer[] = [];
    
    // Находим все элементы с data-viewer
    const elements = document.querySelectorAll('[data-viewer]');
    console.log(`🔍 Найдено ${elements.length} элементов с [data-viewer]`);
    
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as HTMLElement;
        
        // Генерируем ID если нет
        if (!element.id) {
            element.id = `auto-viewer-${i}`;
        }
        
        const viewer = await initFromElement(element.id);
        if (viewer) {
            viewers.push(viewer);
        }
    }
    
    console.log(`✅ Инициализировано ${viewers.length} viewers`);
    return viewers;
}
