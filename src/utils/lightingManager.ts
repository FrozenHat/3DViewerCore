import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { LightConfig, HDRIConfig } from '../types';

export class LightingManager {
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private lights: Map<string, THREE.Light> = new Map();
    private hdriTexture: THREE.Texture | null = null;

    constructor(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.renderer = renderer;
    }

    /**
     * Применение конфигурации освещения
     */
    public applyLightConfig(config: LightConfig): void {
        // Очищаем существующие источники света
        this.clear();

        // Ambient Light
        if (config.ambient?.enabled) {
            const ambient = new THREE.AmbientLight(
                config.ambient.color,
                config.ambient.intensity
            );
            this.lights.set('ambient', ambient);
            this.scene.add(ambient);
            console.log('💡 Ambient light добавлен');
        }

        // Directional Light
        if (config.directional?.enabled) {
            const directional = new THREE.DirectionalLight(
                config.directional.color,
                config.directional.intensity
            );
            directional.position.set(
                config.directional.position.x,
                config.directional.position.y,
                config.directional.position.z
            );
            
            if (config.directional.castShadow) {
                directional.castShadow = true;
                directional.shadow.mapSize.width = 2048;
                directional.shadow.mapSize.height = 2048;
                directional.shadow.camera.near = 0.5;
                directional.shadow.camera.far = 500;
            }
            
            this.lights.set('directional', directional);
            this.scene.add(directional);
            console.log('💡 Directional light добавлен');
        }

        // Point Light
        if (config.point?.enabled) {
            const point = new THREE.PointLight(
                config.point.color,
                config.point.intensity,
                config.point.distance
            );
            point.position.set(
                config.point.position.x,
                config.point.position.y,
                config.point.position.z
            );
            this.lights.set('point', point);
            this.scene.add(point);
            console.log('💡 Point light добавлен');
        }

        // Spot Light
        if (config.spot?.enabled) {
            const spot = new THREE.SpotLight(
                config.spot.color,
                config.spot.intensity
            );
            spot.position.set(
                config.spot.position.x,
                config.spot.position.y,
                config.spot.position.z
            );
            spot.angle = config.spot.angle;
            spot.penumbra = config.spot.penumbra;
            this.lights.set('spot', spot);
            this.scene.add(spot);
            console.log('💡 Spot light добавлен');
        }
    }

    /**
     * Загрузка HDRI окружения
     */
    public async loadHDRI(config: HDRIConfig): Promise<void> {
        if (!config.enabled || !config.url) {
            console.log('⚠️ HDRI отключен или URL не указан');
            return;
        }

        return new Promise((resolve, reject) => {
            const loader = new RGBELoader();
            
            console.log('🌅 Начало загрузки HDRI:', config.url);
            
            loader.load(
                config.url as string,
                (texture) => {
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    
                    this.hdriTexture = texture;
                    
                    // ✅ Устанавливаем окружение
                    this.scene.environment = texture;
                    
                    // ✅ Устанавливаем фон (если включено)
                    if (config.background) {
                        this.scene.background = texture;
                        console.log('✅ HDRI установлен как фон сцены');
                    }
                    
                    // ✅ Tone mapping для HDR
                    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                    this.renderer.toneMappingExposure = config.intensity ?? 1.0;
                    
                    console.log('✅ HDRI загружен и применён');
                    resolve();
                },
                (progress) => {
                    const percent = ((progress.loaded / progress.total) * 100).toFixed(0);
                    console.log(`⏳ HDRI загрузка: ${percent}%`);
                },
                (error) => {
                    console.error('❌ Ошибка загрузки HDRI:', error);
                    reject(error);
                }
            );
        });
    }

    /**
     * Обновление интенсивности света
     */
    public updateLightIntensity(lightName: string, intensity: number): void {
        const light = this.lights.get(lightName);
        if (light) {
            light.intensity = intensity;
            console.log(`💡 ${lightName} интенсивность: ${intensity}`);
        } else {
            console.warn(`⚠️ Источник света "${lightName}" не найден`);
        }
    }

    /**
     * Обновление позиции света
     */
    public updateLightPosition(lightName: string, x: number, y: number, z: number): void {
        const light = this.lights.get(lightName);
        if (light) {
            light.position.set(x, y, z);
            console.log(`💡 ${lightName} позиция:`, { x, y, z });
        } else {
            console.warn(`⚠️ Источник света "${lightName}" не найден`);
        }
    }

    /**
     * Обновление цвета света
     */
    public updateLightColor(lightName: string, color: number): void {
        const light = this.lights.get(lightName);
        if (light) {
            light.color.setHex(color);
            console.log(`💡 ${lightName} цвет: #${color.toString(16)}`);
        } else {
            console.warn(`⚠️ Источник света "${lightName}" не найден`);
        }
    }

    /**
     * Удаление всех источников света
     */
    public clear(): void {
        this.lights.forEach((light, name) => {
            this.scene.remove(light);
            light.dispose();
            console.log(`💡 ${name} удален`);
        });
        this.lights.clear();

        if (this.hdriTexture) {
            this.hdriTexture.dispose();
            this.scene.environment = null;
            this.scene.background = null;
            this.hdriTexture = null;
        }
    }

    /**
     * Получить источник света
     */
    public getLight(name: string): THREE.Light | undefined {
        return this.lights.get(name);
    }

    /**
     * Получить все источники света
     */
    public getAllLights(): Map<string, THREE.Light> {
        return this.lights;
    }
}