import { ViewerConfig } from '../types';

/**
 * Студийное освещение (мягкое, сбалансированное)
 */
export const studioPreset: Partial<ViewerConfig> = {
    lighting: {
        ambient: {
            enabled: true,
            color: 0x404040,
            intensity: 0.4
        },
        directional: {
            enabled: true,
            color: 0xffffff,
            intensity: 1.2,
            position: { x: 5, y: 10, z: 7.5 },
            castShadow: true
        },
        point: {
            enabled: true,
            color: 0xffffff,
            intensity: 0.6,
            position: { x: -5, y: 5, z: 5 },
            distance: 50
        }
    },
    hdri: {
        enabled: false,
        url: './hdri/studio_small_08_1k.hdr',
        intensity: 1.0,
        background: false
    },
    renderer: {
        antialias: true,
        shadowMap: true,
        toneMapping: true
    }
};

/**
 * Уличное освещение (яркое, естественное)
 */
export const outdoorPreset: Partial<ViewerConfig> = {
    lighting: {
        ambient: {
            enabled: true,
            color: 0x87ceeb, // Sky blue
            intensity: 0.5
        },
        directional: {
            enabled: true,
            color: 0xfff4e6, // Warm sunlight
            intensity: 1.5,
            position: { x: 10, y: 20, z: 5 },
            castShadow: true
        }
    },
    hdri: {
        enabled: false,
        url: './hdri/studio_small_08_1k.hdr',
        intensity: 1.2,
        background: true
    },
    renderer: {
        antialias: true,
        shadowMap: true,
        toneMapping: true
    }
};

/**
 * Тёмная сцена с акцентным освещением
 */
export const darkPreset: Partial<ViewerConfig> = {
    lighting: {
        ambient: {
            enabled: true,
            color: 0x202020,
            intensity: 0.2
        },
        directional: {
            enabled: true,
            color: 0x4080ff,
            intensity: 0.8,
            position: { x: -5, y: 8, z: 5 },
            castShadow: true
        },
        spot: {
            enabled: true,
            color: 0xffffff,
            intensity: 1.5,
            position: { x: 0, y: 10, z: 0 },
            angle: Math.PI / 6,
            penumbra: 0.3
        }
    },
    hdri: {
        enabled: false,
        url: './hdri/studio_small_08_1k.hdr',
        intensity: 1.2,
        background: true
    },
    renderer: {
        antialias: true,
        shadowMap: true,
        toneMapping: true
    }
};

/**
 * Минималистичное освещение (только ambient)
 */
export const minimalPreset: Partial<ViewerConfig> = {
    lighting: {
        ambient: {
            enabled: true,
            color: 0xffffff,
            intensity: 1.0
        }
    },
    renderer: {
        antialias: true,
        shadowMap: false,
        toneMapping: false
    }
};