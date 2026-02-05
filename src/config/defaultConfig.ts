import { ViewerConfig } from '../types';

export const defaultConfig: ViewerConfig = {
    containerId: 'container',
    enableSelection: true,
    enableUI: true,
    panelType: 'standard',
    customCssClass: '',
    
    animations: {
        pauseOnFocus: true,
        configs: [],
        autoPlay: false
    },
    
    lighting: {
        ambient: {
            enabled: true,
            color: 0xffffff,
            intensity: 0.6
        },
        directional: {
            enabled: true,
            color: 0xffffff,
            intensity: 0.8,
            position: { x: 10, y: 10, z: 10 },
            castShadow: true
        }
    },
    
    hdri: {
        enabled: true,
        url: 'examples/hdri/studio_small_08_1k.hdr',
        intensity: 1.0,
        background: true
    },
    
    camera: {
        fov: 75,
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