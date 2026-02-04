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

export interface AnimationConfig {
    name: string;
    displayName: string;
    duration: number;
    loop: boolean;
}

export enum AnimationType {
    ASSEMBLY = 'assembly',      // Разбор/сбор
    OPERATION = 'operation'     // Принцип действия
}

export interface ViewerConfig {
    containerId: string;
    animations?: AnimationConfig[];
    enableSelection?: boolean;
    enableUI?: boolean;
}