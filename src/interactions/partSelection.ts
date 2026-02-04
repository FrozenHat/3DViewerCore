import * as THREE from 'three';

export class PartSelection {
    private camera: THREE.Camera;
    private domElement: HTMLElement;
    private raycaster: THREE.Raycaster = new THREE.Raycaster();
    private mouse: THREE.Vector2 = new THREE.Vector2();
    private selectedObject: THREE.Object3D | null = null;
    private hoveredObject: THREE.Object3D | null = null;
    private onSelectCallback?: (object: THREE.Object3D | null) => void;
    private onHoverCallback?: (object: THREE.Object3D | null) => void;
    private root: THREE.Object3D | null;

    constructor(camera: THREE.Camera, domElement: HTMLElement, root: THREE.Object3D | null = null) {
        this.camera = camera;
        this.domElement = domElement;
        this.root = root;
        this.setupEventListeners();
    }

    public setRoot(root: THREE.Object3D): void {
        this.root = root;
        console.log('🎯 Root установлен:', root, 'children:', root.children.length);
    }

    private setupEventListeners(): void {
        this.domElement.addEventListener('click', this.onClick.bind(this));
        this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    private onClick(event: MouseEvent): void {
        this.updateMouse(event);
        const intersects = this.getIntersects();

        if (intersects.length > 0) {
            this.selectedObject = intersects[0].object;
            if (this.onSelectCallback) {
                this.onSelectCallback(this.selectedObject);
            }
        } else {
            this.selectedObject = null;
            if (this.onSelectCallback) {
                this.onSelectCallback(null);
            }
        }
    }

    private onMouseMove(event: MouseEvent): void {
        this.updateMouse(event);
        const intersects = this.getIntersects();

        const newHovered = intersects.length > 0 ? intersects[0].object : null;

        if (newHovered !== this.hoveredObject) {
            // Сброс предыдущего hover
            if (this.hoveredObject && this.onHoverCallback) {
                this.onHoverCallback(null);
            }

            this.hoveredObject = newHovered;

            // Новый hover
            if (this.hoveredObject && this.onHoverCallback) {
                this.onHoverCallback(this.hoveredObject);
            }
        }
    }

    private updateMouse(event: MouseEvent): void {
        const rect = this.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        console.log('🖱️ Mouse updated:', {
            clientX: event.clientX,
            clientY: event.clientY,
            rectLeft: rect.left,
            rectTop: rect.top,
            mouseX: this.mouse.x.toFixed(2),
            mouseY: this.mouse.y.toFixed(2)
        });
    }

    private getIntersects(): THREE.Intersection[] {
        if (!this.root) {
            console.warn('⚠️ Root не установлен!');
            return [];
        }
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const hits = this.raycaster.intersectObject(this.root, true);
        console.log('🔍 Ray hits:', hits.length, 'mouse:', this.mouse.x.toFixed(2), this.mouse.y.toFixed(2));
        if (hits.length > 0) {
            console.log('🎯 Попадание в:', hits[0].object.name || hits[0].object.type);
        }
        return hits;
    }

    /**
     * Подписка на событие выбора объекта
     */
    public onSelect(callback: (object: THREE.Object3D | null) => void): void {
        this.onSelectCallback = callback;
    }

    /**
     * Подписка на событие наведения на объект
     */
    public onHover(callback: (object: THREE.Object3D | null) => void): void {
        this.onHoverCallback = callback;
    }

    /**
     * Получить выбранный объект
     */
    public getSelectedObject(): THREE.Object3D | null {
        return this.selectedObject;
    }

    /**
     * Очистить выбор
     */
    public clearSelection(): void {
        this.selectedObject = null;
        if (this.onSelectCallback) {
            this.onSelectCallback(null);
        }
    }
}