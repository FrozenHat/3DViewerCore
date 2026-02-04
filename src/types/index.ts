import * as THREE from 'three';

export interface Model {
    id: string;
    name: string;
    filePath: string;
    format: string;
}

export interface Animation {
    id: string;
    name: string;
    duration: number;
    keyframes: Array<{ time: number; value: any }>;
}

export interface ViewerOptions {
    backgroundColor?: string;
    enableControls?: boolean;
    enableAnimations?: boolean;
}

export interface PartMetadata {
    name: string;
    description: string;
    material?: string;
    dimensions?: {
        width: number;
        height: number;
        depth: number;
    };
    weight?: number;
    documentation?: string[];
    groupId?: string;
}

export interface LightConfig {
    ambient?: {
        enabled: boolean;
        color: number;
        intensity: number;
    };
    directional?: {
        enabled: boolean;
        color: number;
        intensity: number;
        position: { x: number; y: number; z: number };
        castShadow: boolean;
    };
    point?: {
        enabled: boolean;
        color: number;
        intensity: number;
        position: { x: number; y: number; z: number };
        distance: number;
    };
    spot?: {
        enabled: boolean;
        color: number;
        intensity: number;
        position: { x: number; y: number; z: number };
        angle: number;
        penumbra: number;
    };
}

// ✅ Делаем все поля optional
export interface HDRIConfig {
    enabled?: boolean;
    url?: string;
    intensity?: number;
    background?: boolean;
}

export interface AnimationConfig {
    name: string;
    displayName: string;
    pauseOnFocus?: boolean;
    loop?: boolean;
}

export enum AnimationType {
    ASSEMBLY = 'assembly',
    OPERATION = 'operation',
    CUSTOM = 'custom'
}

export interface ViewerConfig {
    containerId: string;
    enableSelection?: boolean;
    enableUI?: boolean;
    
    lighting?: LightConfig;
    hdri?: HDRIConfig;
    
    animations?: {
        pauseOnFocus?: boolean; // ✅ optional
        configs?: AnimationConfig[]; // ✅ optional
    };
    
    camera?: {
        fov?: number; // ✅ optional
        near?: number;
        far?: number;
        position?: { x: number; y: number; z: number };
    };
    
    renderer?: {
        antialias?: boolean; // ✅ optional
        shadowMap?: boolean;
        toneMapping?: boolean;
    };
}

export interface LoadedAnimation {
    clip: THREE.AnimationClip;
    action?: THREE.AnimationAction;
}