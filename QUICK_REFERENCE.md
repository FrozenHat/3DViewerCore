# Шпаргалка по 3D Viewer Core

## Быстрые команды

### Разработка
```bash
npm install           # Установка зависимостей (первый раз)
npm start            # Запуск dev-сервера с hot-reload
npm run build        # Сборка production версии
npm test             # Запуск тестов
```

## Способы инициализации

### 1️⃣ Базовый способ
```javascript
const viewer = new Viewer('container-id');
viewer.init();
viewer.loadModel('./model.glb');
viewer.render();
```

### 2️⃣ С пресетом
```javascript
const viewer = new Viewer('container-id', ViewerLib.studioPreset);
viewer.init();
viewer.loadModel('./model.glb');
viewer.render();
```

### 3️⃣ Из JSON-конфига (рекомендуется)
```javascript
ViewerLib.initFromConfig('./viewer-config.json');
```

**viewer-config.json:**
```json
{
  "containerId": "viewer-container",
  "modelUrl": "./models/model.glb",
  "preset": "studio",
  "enableSelection": true,
  "enableUI": true,
  "panelType": "standard",
  "hdri": {
    "enabled": true,
    "url": "./hdri/studio_small_08_1k.hdr",
    "intensity": 1.0,
    "background": true
  },
  "animations": {
    "autoPlay": false,
    "pauseOnFocus": true
  }
}
```

### 4️⃣ Автоинициализация из HTML
```html
<div data-viewer
     data-model="./models/model.glb"
     data-preset="studio"
     data-enable-selection="true"
     data-enable-ui="true"
     data-panel-type="standard">
</div>

<script>ViewerLib.autoInit();</script>
```

## Режимы панелей (Panel Types)

### 🎨 Standard (по умолчанию)
Стандартные встроенные панели UI.
```json
{
  "panelType": "standard"
}
```

### 🎨 Changed
Встроенные панели с кастомным CSS-стилем.
```json
{
  "panelType": "changed",
  "customCssClass": "custom-theme"
}
```

**Пример:** `examples/panel-changed-mode.html`

### 🎨 Custom
Без встроенного UI. Полный контроль через API.
```json
{
  "panelType": "custom",
  "enableUI": false
}
```

**API методы для Custom режима:**
```javascript
viewer.getAnimations()           // Получить список анимаций
viewer.getCurrentAnimation()     // Текущая анимация
viewer.getCurrentTime()          // Текущее время
viewer.getAnimationDuration()    // Длительность анимации
viewer.isAnimationPlaying()      // Проигрывается ли анимация
viewer.playAnimation(name)       // Воспроизвести анимацию
viewer.togglePlayPause()         // Переключить play/pause
viewer.resetAnimation()          // Сбросить анимацию
viewer.seekTo(time)              // Перемотать на время
viewer.setPlaybackSpeed(speed)   // Установить скорость
```

**Пример:** `examples/panel-custom-mode.html`

## Доступные пресеты

| Пресет | Описание | Когда использовать |
|--------|----------|-------------------|
| `default` | Базовые настройки | Универсальный вариант |
| `studio` | Студийное освещение | Презентация продуктов |
| `outdoor` | Уличное освещение | Естественный вид |
| `dark` | Тёмная сцена | Драматический эффект |
| `minimal` | Минимальное освещение | Простая визуализация |

**Использование:**
```javascript
ViewerLib.studioPreset
ViewerLib.outdoorPreset
ViewerLib.darkPreset
ViewerLib.minimalPreset
```

## Кастомная конфигурация

### Пример полной конфигурации
```javascript
const customConfig = {
    enableSelection: true,
    enableUI: true,
    panelType: 'standard',
    
    hdri: {
        enabled: true,
        url: 'examples/hdri/studio_small_08_1k.hdr',
        intensity: 1.0,
        background: true
    },
    
    animations: {
        autoPlay: false,         // Анимация на паузе по умолчанию
        pauseOnFocus: true
    },
    
    lighting: {
        ambient: {
            enabled: true,
            color: 0xffffff,
            intensity: 0.8
        },
        directional: {
            enabled: true,
            color: 0xffffff,
            intensity: 1.2,
            position: { x: 10, y: 15, z: 10 },
            castShadow: true
        }
    },
    
    camera: {
        fov: 60,
        near: 0.1,
        far: 1000,
        position: { x: 5, y: 5, z: 5 }
    },
    
    renderer: {
        antialias: true,
        shadowMap: true,
        toneMapping: true
    }
};

const viewer = new Viewer('container', customConfig);
```

## Основные методы API

### Viewer
```javascript
viewer.init()                    // Инициализация
viewer.loadModel(url)           // Загрузка модели
viewer.render()                 // Запуск рендеринга
viewer.dispose()                // Очистка ресурсов
```

### Автоинициализация
```javascript
// Из JSON-файла
ViewerLib.initFromConfig('./config.json')

// Из HTML-элемента
ViewerLib.initFromElement('container-id')

// Автопоиск всех [data-viewer]
ViewerLib.autoInit()
```

## Структура проекта

```
src/
├── core/           Основная логика viewer
├── config/         Конфигурации и пресеты
├── interactions/   Взаимодействия (controls, выбор)
├── loaders/        Загрузчики моделей/анимаций
├── ui/             UI компоненты
├── utils/          Утилиты
├── types/          TypeScript типы
└── autoInit.ts     Автоинициализация
```

## Цвета в конфигурации

Цвета указываются в hex формате без `#`:

```javascript
color: 0xffffff   // Белый
color: 0xff0000   // Красный
color: 0x00ff00   // Зелёный
color: 0x0000ff   // Синий
color: 0xffaa00   // Оранжевый
color: 0xff00ff   // Пурпурный
```

## Типичные задачи

### Изменить цвет подсветки
**Файл:** `src/core/viewer.ts`
```typescript
private hoverColor = new THREE.Color(0xff0000);   // Красный
private selectColor = new THREE.Color(0x00ff00);  // Зелёный
```

### Создать новый пресет
**Файл:** `src/config/presets.ts`
```typescript
export const myPreset: Partial<ViewerConfig> = {
    lighting: { /* настройки */ },
    camera: { /* настройки */ },
    renderer: { /* настройки */ }
};
```

Экспортировать в `src/index.ts`:
```typescript
export { myPreset } from './config/presets';
```

### Изменить настройки по умолчанию
**Файл:** `src/config/defaultConfig.ts`
```typescript
export const defaultConfig: ViewerConfig = {
    // Измените нужные параметры
};
```

## Развёртывание

### 1. Соберите проект
```bash
npm run build
```

### 2. Скопируйте на сервер
- `dist/bundle.js` — основной файл
- `dist/bundle.js.map` — source map (опционально)

### 3. Подключите на сайте
```html
<script src="./bundle.js"></script>
<script>
    ViewerLib.initFromConfig('./viewer-config.json');
</script>
```

## Решение проблем

### Viewer не отображается
✅ Проверьте ID контейнера
✅ Убедитесь что bundle.js загружен
✅ Откройте консоль браузера для ошибок

### Модель не загружается
✅ Проверьте путь к файлу модели
✅ Убедитесь что формат поддерживается (.glb, .gltf)
✅ Проверьте CORS настройки сервера

### После изменений ничего не меняется
✅ Пересоберите проект: `npm run build`
✅ Очистите кэш браузера (Ctrl+F5)
✅ Проверьте путь к bundle.js

## Полезные ссылки

- [Подробное руководство](./BEGINNER_GUIDE.md)
- [Примеры использования](./examples/)
- [Three.js документация](https://threejs.org/docs/)

---

**Версия:** 1.0.0  
**Обновлено:** 2026-02-05
