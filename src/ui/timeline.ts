export class Timeline {
    private container: HTMLElement;
    private slider: HTMLInputElement;
    private timeDisplay: HTMLSpanElement;
    private duration: number = 0;
    private onSeek?: (time: number) => void;

    constructor(containerId: string) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container ${containerId} not found`);
        }
        this.container = container;
        this.createUI();
        this.slider = this.container.querySelector('#timeline-slider') as HTMLInputElement;
        this.timeDisplay = this.container.querySelector('#time-display') as HTMLSpanElement;
        this.attachEventListeners();
    }

    private createUI(): void {
        this.container.innerHTML = `
            <div class="timeline-container">
                <span id="time-display">0:00 / 0:00</span>
                <input type="range" id="timeline-slider" min="0" max="1000" value="0" step="1">
            </div>
        `;
    }

    private attachEventListeners(): void {
        this.slider.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const progress = parseFloat(target.value) / 1000;
            const time = progress * this.duration;
            this.updateTimeDisplay(time);
            
            if (this.onSeek) {
                this.onSeek(time);
            }
        });
    }

    public setDuration(duration: number): void {
        this.duration = duration;
        this.updateTimeDisplay(0);
    }

    public setCurrentTime(time: number): void {
        const progress = (time / this.duration) * 1000;
        this.slider.value = progress.toString();
        this.updateTimeDisplay(time);
    }

    private updateTimeDisplay(current: number): void {
        const formatTime = (seconds: number): string => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        this.timeDisplay.textContent = `${formatTime(current)} / ${formatTime(this.duration)}`;
    }

    public onTimeSeek(callback: (time: number) => void): void {
        this.onSeek = callback;
    }
}