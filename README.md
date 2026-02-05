# 3D Viewer Core

## Overview
The 3D Viewer Core is a compact, embeddable solution designed for rendering complex mechanical models with animations and interactive part selection. It provides an easy-to-use API for seamless integration into any website.

## 📚 Documentation

- **[Beginner's Guide (Russian)](./BEGINNER_GUIDE.md)** - Подробное руководство для новичков на русском языке
- **[Examples](./examples/)** - Ready-to-use examples and demos

## Features
- **3D Model Rendering**: Load and display complex mechanical models in various formats.
- **Animations**: Support for model animations, allowing for dynamic presentations.
- **Interactive Part Selection**: Users can interactively select and highlight parts of the model.
- **Customizable Controls**: Manage user input for navigating the 3D scene.
- **Simple API**: Easy integration into web applications with a straightforward API.
- **Auto-initialization**: Multiple ways to initialize viewers with minimal code.
- **Presets**: Pre-configured lighting and rendering presets (Studio, Outdoor, Dark, Minimal).

## Installation
To install the 3D Viewer Core, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd 3d-viewer-core
npm install
```

## Quick Start

### Development Mode
```bash
npm start
```
This starts a development server with hot-reloading at `http://localhost:8080`.

### Build for Production
```bash
npm run build
```
This creates a production-ready `dist/bundle.js` file.

## Usage

### Method 1: Basic Initialization
```html
<div id="viewer-container"></div>

<script src="./dist/bundle.js"></script>
<script>
    const viewer = new window.Viewer('viewer-container');
    viewer.init();
    viewer.loadModel('./models/model.glb');
    viewer.render();
</script>
```

### Method 2: Using Presets
```html
<script src="./dist/bundle.js"></script>
<script>
    // Use a built-in preset
    const viewer = new window.Viewer('viewer-container', window.ViewerLib.studioPreset);
    viewer.init();
    viewer.loadModel('./models/model.glb');
    viewer.render();
</script>
```

### Method 3: Config File (Recommended)
Create a `viewer-config.json`:
```json
{
  "containerId": "viewer-container",
  "modelUrl": "./models/model.glb",
  "preset": "studio",
  "enableSelection": true,
  "enableUI": true
}
```

Initialize from config:
```html
<script src="./dist/bundle.js"></script>
<script>
    ViewerLib.initFromConfig('./viewer-config.json');
</script>
```

### Method 4: Auto-init with Data Attributes
```html
<div data-viewer
     data-model="./models/model.glb"
     data-preset="studio"
     data-enable-selection="true"
     data-enable-ui="true">
</div>

<script src="./dist/bundle.js"></script>
<script>
    ViewerLib.autoInit();
</script>
```

## Examples

### Basic Examples
- `examples/basic-viewer.html` - Simple viewer setup
- `examples/advanced-setup.html` - Advanced configuration
- `examples/config-init.html` - Config-based initialization
- `examples/auto-init.html` - Auto-initialization with data attributes

### Available Presets
- **default** - Balanced lighting for general use
- **studio** - Soft, balanced studio lighting
- **outdoor** - Bright, natural outdoor lighting
- **dark** - Dark scene with accent lighting
- **minimal** - Minimal ambient-only lighting

## API Documentation
The API provides methods for initializing the viewer, loading models, and setting viewer options. For detailed API usage, refer to the `src/api/embedAPI.ts` file.

## Project Structure
```
src/
├── core/           # Core viewer functionality
├── config/         # Configuration and presets
├── interactions/   # User interactions (controls, selection)
├── loaders/        # Model and animation loaders
├── ui/            # UI components
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── autoInit.ts    # Auto-initialization helpers
```

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.