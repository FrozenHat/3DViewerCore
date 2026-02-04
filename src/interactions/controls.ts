import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

export class Controls {
    private controls: OrbitControls;

    constructor(camera: THREE.Camera, domElement: HTMLElement) {
        this.controls = new OrbitControls(camera, domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
    }

    public update(): void {
        this.controls.update();
    }

    public getOrbitControls(): OrbitControls {
        return this.controls;
    }

    public dispose(): void {
        this.controls.dispose();
    }
}