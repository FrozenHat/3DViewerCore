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
    preset?: 'default' | 'studio' | 'outdoor' | 'dark' | 'minimal';
    enableSelection?: boolean;
    enableUI?: boolean;
    customLighting?: any;
    customCamera?: any;
    customRenderer?: any;
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
        
        // Выбираем базовый пресет
        let viewerConfig: Partial<ViewerConfig> = {};
        
        switch(config.preset) {
            case 'studio':
                viewerConfig = { ...studioPreset };
                console.log('🎨 Применён пресет: Studio');
                break;
            case 'outdoor':
                viewerConfig = { ...outdoorPreset };
                console.log('🎨 Применён пресет: Outdoor');
                break;
            case 'dark':
                viewerConfig = { ...darkPreset };
                console.log('🎨 Применён пресет: Dark');
                break;
            case 'minimal':
                viewerConfig = { ...minimalPreset };
                console.log('🎨 Применён пресет: Minimal');
                break;
            default:
                viewerConfig = { ...defaultConfig };
                console.log('🎨 Применён пресет: Default');
        }
        
        // Применяем кастомные настройки из конфига
        if (config.enableSelection !== undefined) {
            viewerConfig.enableSelection = config.enableSelection;
        }
        
        if (config.enableUI !== undefined) {
            viewerConfig.enableUI = config.enableUI;
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
            preset: (dataset.preset as any) || 'default',
            enableSelection: dataset.enableSelection === 'true',
            enableUI: dataset.enableUi === 'true'
        };
        
        console.log('✅ Конфигурация из data-атрибутов:', config);
        
        // Используем общую функцию инициализации
        // Создаём временный URL для конфига (используем тот же код)
        let viewerConfig: Partial<ViewerConfig> = {};
        
        switch(config.preset) {
            case 'studio': viewerConfig = { ...studioPreset }; break;
            case 'outdoor': viewerConfig = { ...outdoorPreset }; break;
            case 'dark': viewerConfig = { ...darkPreset }; break;
            case 'minimal': viewerConfig = { ...minimalPreset }; break;
            default: viewerConfig = { ...defaultConfig };
        }
        
        viewerConfig.enableSelection = config.enableSelection;
        viewerConfig.enableUI = config.enableUI;
        
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
