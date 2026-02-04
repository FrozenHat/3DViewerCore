import * as THREE from 'three';

export interface LoadedAnimation {
    clip: THREE.AnimationClip;
    action?: THREE.AnimationAction;
}

export class AnimationLoader {
    private animations: Map<string, LoadedAnimation> = new Map();

    /**
     * Загрузка анимаций из массива клипов
     */
    public loadAnimations(clips: THREE.AnimationClip[]): void {
        clips.forEach((clip) => {
            this.animations.set(clip.name, { clip });
            console.log(`✅ Анимация загружена: ${clip.name} (${clip.duration.toFixed(2)}s)`);
        });
    }

    /**
     * Установка анимаций (алиас для loadAnimations)
     */
    public setAnimations(clips: THREE.AnimationClip[]): void {
        this.loadAnimations(clips);
    }

    /**
     * Получить анимацию по имени
     */
    public getAnimation(name: string): LoadedAnimation | undefined {
        return this.animations.get(name);
    }

    /**
     * Получить все анимации
     */
    public getAllAnimations(): Map<string, LoadedAnimation> {
        return this.animations;
    }

    /**
     * Получить список имен анимаций
     */
    public getAnimationNames(): string[] {
        return Array.from(this.animations.keys());
    }

    /**
     * Очистить все анимации
     */
    public clear(): void {
        this.animations.clear();
    }
}