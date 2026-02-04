export class Timeline {
    private keyframes: Array<{ time: number; value: any }>;

    constructor() {
        this.keyframes = [];
    }

    public addKeyframe(time: number, value: any): void {
        this.keyframes.push({ time, value });
        this.keyframes.sort((a, b) => a.time - b.time);
    }

    public getKeyframeAt(time: number): any {
        for (let i = 0; i < this.keyframes.length; i++) {
            if (this.keyframes[i].time > time) {
                return this.keyframes[i - 1] ? this.keyframes[i - 1].value : null;
            }
        }
        return this.keyframes[this.keyframes.length - 1]?.value || null;
    }

    public getTimeline(): Array<{ time: number; value: any }> {
        return this.keyframes;
    }
}