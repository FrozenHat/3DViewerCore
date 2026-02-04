import { AnimationConfig, AnimationType } from '../types';

export class AnimationPanel {
    private container: HTMLElement;
    private currentAnimation: string | null = null;
    private onAnimationChange?: (name: string) => void;
    private onPlayPause?: () => void;
    private onReset?: () => void;

    constructor(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container ${containerId} not found`);
        }
        this.container = container;
        this.createUI();
    }

    private createUI(): void {
        this.container.innerHTML = `
            <div class="animation-panel">
                <div class="animation-selector">
                    <h3>Анимация</h3>
                    <label>
                        <input type="radio" name="animation" value="${AnimationType.ASSEMBLY}" checked>
                        Разбор/Сбор
                    </label>
                    <label>
                        <input type="radio" name="animation" value="${AnimationType.OPERATION}">
                        Принцип действия
                    </label>
                </div>
                
                <div class="animation-controls">
                    <button id="playPauseBtn" class="btn-play">▶ Play</button>
                    <button id="resetBtn" class="btn-reset">⟲ Reset</button>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    private attachEventListeners(): void {
        // Радио-кнопки
        const radios = this.container.querySelectorAll('input[name="animation"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                if (this.onAnimationChange) {
                    this.onAnimationChange(target.value);
                }
            });
        });

        // Play/Pause
        const playBtn = this.container.querySelector('#playPauseBtn');
        playBtn?.addEventListener('click', () => {
            if (this.onPlayPause) {
                this.onPlayPause();
            }
        });

        // Reset
        const resetBtn = this.container.querySelector('#resetBtn');
        resetBtn?.addEventListener('click', () => {
            if (this.onReset) {
                this.onReset();
            }
        });
    }

    public setPlayState(isPlaying: boolean): void {
        const btn = this.container.querySelector('#playPauseBtn');
        if (btn) {
            btn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
        }
    }

    public onAnimationSelect(callback: (name: string) => void): void {
        this.onAnimationChange = callback;
    }

    public onPlay(callback: () => void): void {
        this.onPlayPause = callback;
    }

    public onResetClick(callback: () => void): void {
        this.onReset = callback;
    }
}