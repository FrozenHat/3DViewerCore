import * as THREE from 'three';

export class CameraFocus {
    private camera: THREE.PerspectiveCamera;
    private controls: any; // OrbitControls
    private focusedObject: THREE.Object3D | null = null;
    private isFollowing: boolean = false;

    constructor(camera: THREE.PerspectiveCamera, controls: any) {
        this.camera = camera;
        this.controls = controls;
    }

    /**
     * Фокусировка на объекте
     */
    public focusOn(object: THREE.Object3D, animate: boolean = true): void {
        this.focusedObject = object;
        this.isFollowing = true;

        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 2.5; // Отступ

        const targetPosition = new THREE.Vector3(
            center.x + cameraZ * 0.5,
            center.y + cameraZ * 0.3,
            center.z + cameraZ
        );

        if (animate) {
            this.animateCamera(targetPosition, center);
        } else {
            this.camera.position.copy(targetPosition);
            this.controls.target.copy(center);
            this.controls.update();
        }

        console.log(`📹 Камера сфокусирована на объект: ${object.name || 'без имени'}`);
    }

    /**
     * Анимация движения камеры
     */
    private animateCamera(targetPos: THREE.Vector3, targetLookAt: THREE.Vector3): void {
        const startPos = this.camera.position.clone();
        const startLookAt = this.controls.target.clone();
        const duration = 1000; // 1 секунда
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);

            this.camera.position.lerpVectors(startPos, targetPos, eased);
            this.controls.target.lerpVectors(startLookAt, targetLookAt, eased);
            this.controls.update();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    /**
     * Обновление позиции камеры (следование за объектом в анимации)
     */
    public update(): void {
        if (this.isFollowing && this.focusedObject) {
            const box = new THREE.Box3().setFromObject(this.focusedObject);
            const center = box.getCenter(new THREE.Vector3());
            this.controls.target.copy(center);
            this.controls.update();
        }
    }

    /**
     * Сброс фокуса
     */
    public reset(): void {
        this.focusedObject = null;
        this.isFollowing = false;
        console.log('📹 Фокус камеры сброшен');
    }

    /**
     * Easing функция
     */
    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    public isCurrentlyFocused(): boolean {
        return this.isFollowing;
    }

    public getFocusedObject(): THREE.Object3D | null {
        return this.focusedObject;
    }
}