import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Controls } from '../interactions/controls';
import { PartSelection } from '../interactions/partSelection';
import { CameraFocus } from '../interactions/cameraFocus';
import { AnimationLoader } from '../loaders/animationLoader';
import { AnimationPanel } from '../ui/animationPanel';
import { Timeline } from '../ui/timeline';
import { DetailCard } from '../ui/detailCard';
import { LightingManager } from '../utils/lightingManager';
import { ViewerConfig, LightConfig, PartMetadata } from '../types'; // ✅ ДОБАВИТЬ
import { defaultConfig } from '../config/defaultConfig';

export class Viewer {
  private containerId: string;
  private container: HTMLElement | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private loader: GLTFLoader = new GLTFLoader();
  private controls: Controls | null = null;
  private partSelection: PartSelection | null = null;
  private cameraFocus: CameraFocus | null = null;
  private animationLoader: AnimationLoader = new AnimationLoader();
  private mixer: THREE.AnimationMixer | null = null;
  private clock: THREE.Clock = new THREE.Clock();
  
  // UI Components
  private animationPanel: AnimationPanel | null = null;
  private timeline: Timeline | null = null;
  private detailCard: DetailCard | null = null;
  
  // State
  private isPlaying: boolean = false;
  private currentAnimation: string = 'assembly';
  private clickCount: number = 0;
  private clickTimer: any = null;
  private modelLoadedCallback: (() => void) | null = null;

  private hoveredMeshes: Set<THREE.Mesh> = new Set();
  private selectedMeshes: Set<THREE.Mesh> = new Set();

  private hoverColor = new THREE.Color(0x667eea);
  private selectColor = new THREE.Color(0x3cb371);

  private config: ViewerConfig;
  private lightingManager: LightingManager | null = null;
  private pauseOnFocus: boolean = true;
  private wasPlayingBeforeFocus: boolean = false;

  constructor(containerId: string, config?: Partial<ViewerConfig>) {
    this.containerId = containerId;
    
    // ✅ Безопасное слияние с проверками
    this.config = {
      containerId,
      enableSelection: config?.enableSelection ?? defaultConfig.enableSelection,
      enableUI: config?.enableUI ?? defaultConfig.enableUI,
      panelType: config?.panelType ?? defaultConfig.panelType,
      customCssClass: config?.customCssClass ?? defaultConfig.customCssClass,
      
      lighting: {
        ambient: {
          enabled: config?.lighting?.ambient?.enabled ?? defaultConfig.lighting?.ambient?.enabled ?? true,
          color: config?.lighting?.ambient?.color ?? defaultConfig.lighting?.ambient?.color ?? 0xffffff,
          intensity: config?.lighting?.ambient?.intensity ?? defaultConfig.lighting?.ambient?.intensity ?? 1.0
        },
        directional: {
          enabled: config?.lighting?.directional?.enabled ?? defaultConfig.lighting?.directional?.enabled ?? true,
          color: config?.lighting?.directional?.color ?? defaultConfig.lighting?.directional?.color ?? 0xffffff,
          intensity: config?.lighting?.directional?.intensity ?? defaultConfig.lighting?.directional?.intensity ?? 1.0,
          position: {
            x: 0,
            y: 0,
            z: 0
          },
          castShadow: false
        },
        point: config?.lighting?.point,
        spot: config?.lighting?.spot
      },
      
      hdri: {
        enabled: config?.hdri?.enabled ?? defaultConfig.hdri?.enabled ?? false,
        url: config?.hdri?.url ?? defaultConfig.hdri?.url ?? '',
        intensity: config?.hdri?.intensity ?? defaultConfig.hdri?.intensity ?? 1.0,
        background: config?.hdri?.background ?? defaultConfig.hdri?.background ?? false
      },
      
      camera: {
        fov: config?.camera?.fov ?? defaultConfig.camera?.fov ?? 75,
        near: config?.camera?.near ?? defaultConfig.camera?.near ?? 0.1,
        far: config?.camera?.far ?? defaultConfig.camera?.far ?? 1000,
        position: config?.camera?.position ?? defaultConfig.camera?.position ?? { x: 5, y: 5, z: 5 }
      },
      
      renderer: {
        antialias: config?.renderer?.antialias ?? defaultConfig.renderer?.antialias ?? true,
        shadowMap: config?.renderer?.shadowMap ?? defaultConfig.renderer?.shadowMap ?? true,
        toneMapping: config?.renderer?.toneMapping ?? defaultConfig.renderer?.toneMapping ?? true
      },
      
      animations: {
        pauseOnFocus: config?.animations?.pauseOnFocus ?? defaultConfig.animations?.pauseOnFocus ?? true,
        configs: config?.animations?.configs ?? defaultConfig.animations?.configs ?? [],
        autoPlay: config?.animations?.autoPlay ?? defaultConfig.animations?.autoPlay ?? false
      }
    };

    this.pauseOnFocus = this.config.animations?.pauseOnFocus ?? true;
    
    console.log('🎬 Viewer создан с конфигурацией:', this.config);
  }

  public init(): void {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      throw new Error(`Container with id "${this.containerId}" not found`);
    }
    console.log('1. Container found:', this.container);

    // Apply custom CSS class if panel type is "changed"
    if (this.config.panelType === 'changed' && this.config.customCssClass) {
      this.container.classList.add(this.config.customCssClass);
      console.log(`✅ Applied custom CSS class: ${this.config.customCssClass}`);
    }

    // Ensure container is positioned relatively for UI elements
    if (getComputedStyle(this.container).position === 'static') {
      this.container.style.position = 'relative';
    }

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    console.log('2. Container size:', width, 'x', height);

    this.scene = new THREE.Scene();
    console.log('3. Scene created');

    // Камера с настройками из конфига
    this.camera = new THREE.PerspectiveCamera(
      this.config.camera?.fov ?? 75,
      width / height,
      this.config.camera?.near ?? 0.1,
      this.config.camera?.far ?? 1000
    );
    
    const camPos = this.config.camera?.position ?? { x: 5, y: 5, z: 5 };
    this.camera.position.set(camPos.x, camPos.y, camPos.z);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: this.config.renderer?.antialias ?? true 
    });
    
    if (this.config.renderer?.shadowMap) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    console.log('5. Renderer created');

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    console.log('6. Renderer configured');
    console.log('7. Before appendChild - container children:', this.container.children.length);
    console.log('8. Canvas element:', this.renderer.domElement);

    this.container.appendChild(this.renderer.domElement);
    console.log('9. After appendChild - container children:', this.container.children.length);
    console.log('10. Canvas in DOM:', this.container.querySelector('canvas'));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);
    console.log('11. Lights added');

    this.controls = new Controls(this.camera, this.renderer.domElement);
    this.partSelection = new PartSelection(this.camera, this.renderer.domElement, this.scene);
    this.cameraFocus = new CameraFocus(this.camera, this.controls.getOrbitControls());

    // Инициализация освещения
    this.lightingManager = new LightingManager(this.scene, this.renderer);
    
    if (this.config.lighting) {
        this.lightingManager.applyLightConfig(this.config.lighting);
    }

    // ✅ HDRI загружается АСИНХРОННО
    if (this.config.hdri?.enabled && this.config.hdri?.url) {
        console.log('🌅 Загрузка HDRI:', this.config.hdri.url);
        this.lightingManager.loadHDRI(this.config.hdri)
            .then(() => {
                console.log('✅ HDRI загружен успешно');
            })
            .catch((error) => {
                console.error('❌ Ошибка загрузки HDRI:', error);
            });
    } else {
        console.log('⚠️ HDRI отключен или URL не указан');
    }

    // Инициализация UI (only if panelType is not "custom")
    if (this.config.panelType !== 'custom') {
      this.initUI();
    }

    // Add resize handler
    this.setupResizeHandler();

    console.log('Viewer initialized successfully');
  }

  private initUI(): void {
    this.createUIContainers();

    this.animationPanel = new AnimationPanel('animation-panel-container');
    this.timeline = new Timeline('timeline-container');
    this.detailCard = new DetailCard('detail-card-container');

    this.setupUIHandlers();
  }

  private createUIContainers(): void {
    if (!this.container) return;

    const containers = [
      { id: 'animation-panel-container', html: '<div id="animation-panel-container"></div>' },
      { id: 'timeline-container', html: '<div id="timeline-container"></div>' },
      { id: 'detail-card-container', html: '<div id="detail-card-container"></div>' }
    ];

    containers.forEach(({ id, html }) => {
      if (!document.getElementById(id)) {
        this.container!.insertAdjacentHTML('beforeend', html);
        console.log(`✅ Создан контейнер: ${id}`);
      } else {
        console.log(`ℹ️ Контейнер уже существует: ${id}`);
      }
    });
    
    // Проверка через 100ms
    setTimeout(() => {
      console.log('🔍 Проверка DOM:');
      console.log('  - animation-panel:', !!document.getElementById('animation-panel-container'));
      console.log('  - timeline:', !!document.getElementById('timeline-container'));
      console.log('  - detail-card:', !!document.getElementById('detail-card-container'));
    }, 100);
  }

  private setupUIHandlers(): void {
    // Смена анимации
    this.animationPanel?.onAnimationSelect((name) => {
      console.log(`🎬 Переключение на анимацию: ${name}`);
      this.currentAnimation = name;
      this.playAnimation(name);
    });

    // Play/Pause с учётом фокуса
    this.animationPanel?.onPlay(() => {
      if (this.wasPlayingBeforeFocus && !this.isPlaying) {
        this.resumeAnimation();
      } else {
        this.togglePlayPause();
      }
    });

    // Reset
    this.animationPanel?.onResetClick(() => {
      this.resetAnimation();
    });

    // Timeline seek
    this.timeline?.onTimeSeek((time) => {
      if (this.mixer) {
        this.mixer.setTime(time);
      }
    });

    // Закрытие карточки
    this.detailCard?.onCloseCard(() => {
      this.cameraFocus?.reset();
    });

    // Изоляция группы
    this.detailCard?.onIsolateGroup((groupId) => {
      this.isolateGroup(groupId);
    });

    // Закрытие по Escape
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.clearSelection();
      }
    });
  }

  public loadModel(modelUrl: string): void {
    console.log(`📦 Загрузка модели: ${modelUrl}`);
    
    this.loader.load(
      modelUrl,
      (gltf) => {
        console.log('✅ Модель загружена');
        console.log('📊 Количество мешей:', this.countMeshes(gltf.scene));
        
        if (this.scene) {
          this.scene.add(gltf.scene);
          
          if (this.partSelection) {
            this.partSelection.setRoot(gltf.scene);
            console.log('🎯 PartSelection root установлен:', gltf.scene);
          }
          
          this.setupPartSelection(gltf.scene);
          
          if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(gltf.scene);
            
            if (gltf.animations[0]) {
              gltf.animations[0].name = 'assembly'; // Разбор/сбор
            }
            if (gltf.animations[1]) {
              gltf.animations[1].name = 'operation'; // Принцип действия
            }
            
            this.animationLoader.setAnimations(gltf.animations);
            
            const duration = gltf.animations[0].duration;
            this.timeline?.setDuration(duration);
            
            console.log('🎬 Анимации загружены:', gltf.animations.map(a => a.name));
            
            // ✅ Autoplay только если включено в конфиге
            if (this.config.animations?.autoPlay) {
              this.playAnimation('assembly');
              console.log('▶️ Autoplay enabled - starting animation');
            } else {
              console.log('⏸️ Autoplay disabled - animation paused');
            }
          }
          
          this.fitCameraToModel(gltf.scene);
          
          // Call the model loaded callback if set
          if (this.modelLoadedCallback) {
            this.modelLoadedCallback();
          }
        }
      },
      (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(0);
        console.log(`⏳ Загрузка: ${percent}%`);
      },
      (error) => {
        console.error('❌ Ошибка загрузки модели:', error);
      }
    );
  }

  private countMeshes(object: THREE.Object3D): number {
    let count = 0;
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) count++;
    });
    return count;
  }

  private setupPartSelection(model: THREE.Object3D): void {
    if (!this.partSelection || !this.camera || !this.renderer) return;

    this.partSelection.onHover((object: THREE.Object3D | null) => {
      this.setHoverObject(object);
    });

    this.partSelection.onSelect((object: THREE.Object3D | null) => {
      // ✅ Если клик по пустому месту — сброс
      if (!object) {
        this.clearSelection();
        return;
      }

      // ✅ Устанавливаем выбранный объект
      this.setSelectedObject(object);

      // ✅ Обработка одинарного/двойного клика
      this.clickCount++;
      if (this.clickTimer) clearTimeout(this.clickTimer);

      this.clickTimer = setTimeout(() => {
        if (this.clickCount === 1) {
          this.handleSingleClick(object);
        } else if (this.clickCount >= 2) {
          this.handleDoubleClick(object);
        }
        this.clickCount = 0;
      }, 300);
    });
  }

  private setHoverObject(object: THREE.Object3D | null): void {
    this.clearMeshes(this.hoveredMeshes, this.selectedMeshes, this.selectColor);

    if (!object) return;

    this.collectMeshes(object).forEach((mesh) => {
      this.hoveredMeshes.add(mesh);
      if (!this.selectedMeshes.has(mesh)) {
        this.applyHighlight(mesh, this.hoverColor, 0.3);
      }
    });
  }

  private setSelectedObject(object: THREE.Object3D | null): void {
    this.clearMeshes(this.selectedMeshes, this.hoveredMeshes, this.hoverColor);

    if (!object) return;

    this.collectMeshes(object).forEach((mesh) => {
      this.selectedMeshes.add(mesh);
      this.applyHighlight(mesh, this.selectColor, 0.35);
    });
  }

  private collectMeshes(object: THREE.Object3D): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
    });
    return meshes;
  }

  private applyHighlight(mesh: THREE.Mesh, color: THREE.Color, intensity: number): void {
    const material = mesh.material as THREE.MeshStandardMaterial;
    if (!material) return;

    if (mesh.userData.__origEmissive === undefined) {
      mesh.userData.__origEmissive = material.emissive?.getHex() ?? 0x000000;
      mesh.userData.__origEmissiveIntensity = material.emissiveIntensity ?? 0;
    }

    material.emissive = color;
    material.emissiveIntensity = intensity;
  }

  private restoreMesh(mesh: THREE.Mesh): void {
    const material = mesh.material as THREE.MeshStandardMaterial;
    if (!material) return;

    if (mesh.userData.__origEmissive !== undefined) {
      material.emissive = new THREE.Color(mesh.userData.__origEmissive);
      material.emissiveIntensity = mesh.userData.__origEmissiveIntensity ?? 0;
    }
  }

  private clearMeshes(
    source: Set<THREE.Mesh>,
    fallback: Set<THREE.Mesh>,
    fallbackColor: THREE.Color
  ): void {
    source.forEach((mesh) => {
      if (fallback.has(mesh)) {
        this.applyHighlight(mesh, fallbackColor, 0.3);
      } else {
        this.restoreMesh(mesh);
      }
    });
    source.clear();
  }

  private togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;
    this.animationPanel?.setPlayState(this.isPlaying);
    
    if (this.mixer) {
      this.mixer.timeScale = this.isPlaying ? 1 : 0;
    }
  }

  private resetAnimation(): void {
    if (this.mixer) {
      this.mixer.setTime(0);
      this.timeline?.setCurrentTime(0);
      this.isPlaying = false;
      this.animationPanel?.setPlayState(false);
    }
  }

  private isolateGroup(groupId: string): void {
    console.log(`🔍 Изоляция группы: ${groupId}`);
    
    this.scene?.traverse((object) => {
      if (object.userData.groupId === groupId) {
        object.visible = true;
      } else if (object.userData.groupId) {
        object.visible = false;
      }
    });
  }

  private fitCameraToModel(object: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera!.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    cameraZ *= 2;

    this.camera!.position.set(center.x, center.y, center.z + cameraZ);
    this.camera!.lookAt(center);
    this.camera!.updateProjectionMatrix();

    if (this.controls) {
      this.controls.getOrbitControls().target.copy(center);
      this.controls.update();
    }

    console.log(`📐 Камера настроена для модели`);
  }

  public playAnimation(name?: string): void {
    if (!this.mixer) {
      console.warn('⚠️ Mixer не инициализирован');
      return;
    }

    const animName = name || this.currentAnimation;
    const animation = this.animationLoader.getAnimation(animName);

    if (animation) {
      // Останавливаем все текущие анимации
      this.mixer.stopAllAction();
      
      const action = this.mixer.clipAction(animation.clip);
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
      
      this.isPlaying = true;
      this.animationPanel?.setPlayState(true);
      this.currentAnimation = animName;
      
      console.log(`▶ Воспроизведение анимации: ${animName} (${animation.clip.duration.toFixed(2)}s)`);
    } else {
      console.error(`❌ Анимация "${animName}" не найдена`);
    }
  }

  public stopAnimation(): void {
    this.isPlaying = false;
    this.animationPanel?.setPlayState(false);
    if (this.mixer) {
      this.mixer.timeScale = 0;
    }
  }

  public render(): void {
    console.log('Starting render loop');
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      const delta = this.clock.getDelta();
      
      if (this.mixer && this.isPlaying) {
        this.mixer.update(delta);
        const time = this.mixer.time;
        this.timeline?.setCurrentTime(time);
      }
      
      this.cameraFocus?.update();
      this.controls?.update();
      
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    
    animate();
  }

  public addTestCube(): void {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    cube.name = 'TestCube';
    
    if (this.scene) {
      this.scene.add(cube);
      console.log('✅ Test cube added');
    }
  }

  public dispose(): void {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
  }

  /**
   * Setup window resize handler
   */
  private setupResizeHandler(): void {
    const resizeObserver = new ResizeObserver(() => {
      this.onResize();
    });
    
    if (this.container) {
      resizeObserver.observe(this.container);
    }
  }

  /**
   * Handle container resize
   */
  private onResize(): void {
    if (!this.container || !this.camera || !this.renderer) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // Update camera aspect ratio
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Update renderer size
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    console.log(`📐 Canvas resized to ${width}x${height}`);
  }

  /**
   * Set callback to be called when model is loaded
   */
  public onModelLoaded(callback: () => void): void {
    this.modelLoadedCallback = callback;
  }

  /**
   * API Methods for Custom Panel Mode
   * These methods allow external UI to control the viewer
   */

  /**
   * Get list of available animations
   */
  public getAnimations(): Array<{ name: string; duration: number }> {
    if (!this.animationLoader) return [];
    
    const animations = Array.from(this.animationLoader.getAllAnimations().values());
    return animations.map(anim => ({
      name: anim.clip.name,
      duration: anim.clip.duration
    }));
  }

  /**
   * Get current animation name
   */
  public getCurrentAnimation(): string {
    return this.currentAnimation;
  }

  /**
   * Get current animation time
   */
  public getCurrentTime(): number {
    return this.mixer?.time ?? 0;
  }

  /**
   * Get animation duration
   */
  public getAnimationDuration(name?: string): number {
    if (!this.animationLoader) return 0;
    
    const animName = name || this.currentAnimation;
    const animation = this.animationLoader.getAnimation(animName);
    return animation?.clip.duration ?? 0;
  }

  /**
   * Check if animation is playing
   */
  public isAnimationPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Seek to specific time in animation
   */
  public seekTo(time: number): void {
    if (this.mixer) {
      this.mixer.setTime(time);
      this.timeline?.setCurrentTime(time);
    }
  }

  /**
   * Set playback speed
   */
  public setPlaybackSpeed(speed: number): void {
    if (this.mixer) {
      this.mixer.timeScale = speed;
    }
  }

  /**
   * Get scene for advanced manipulation
   */
  public getScene(): THREE.Scene | null {
    return this.scene;
  }

  /**
   * Get camera for advanced manipulation
   */
  public getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }

  /**
   * Get renderer for advanced manipulation
   */
  public getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  private handleSingleClick(object: THREE.Object3D): void {
    console.log('👆 Одинарный клик:', object.name);
    
    // Пауза при фокусе (если включено)
    if (this.pauseOnFocus && this.isPlaying) {
      this.wasPlayingBeforeFocus = true;
      this.stopAnimation();
      console.log('⏸️ Анимация остановлена для фокуса');
    }
    
    this.cameraFocus?.focusOn(object);
  }

  /**
   * Возобновление анимации после фокуса
   */
  public resumeAnimation(): void {
    if (this.wasPlayingBeforeFocus) {
      this.togglePlayPause();
      this.wasPlayingBeforeFocus = false;
      console.log('▶️ Анимация возобновлена после фокуса');
    }
  }

  /**
   * Обновление освещения
   */
  public updateLighting(config: LightConfig): void {
    if (!this.lightingManager) {
      console.warn('⚠️ LightingManager не инициализирован');
      return;
    }
    
    console.log('💡 Обновление освещения:', config);
    this.lightingManager.applyLightConfig(config);
  }

  /**
   * Загрузка HDRI
   */
  public async loadHDRI(url: string, intensity: number = 1.0, background: boolean = false): Promise<void> {
    if (!this.lightingManager) {
      console.warn('⚠️ LightingManager не инициализирован');
      return;
    }
    
    await this.lightingManager.loadHDRI({
      enabled: true,
      url,
      intensity,
      background
    });
  }

  private clearSelection(): void {
    console.log('🔄 Сброс выбора');
    this.detailCard?.hide();
    this.cameraFocus?.reset();
    this.setSelectedObject(null);
  }

  private handleDoubleClick(object: THREE.Object3D): void {
    console.log('👆👆 Двойной клик:', object.name);
    
    const metadata: PartMetadata = object.userData.metadata || {
      name: object.name || 'Деталь без имени',
      description: object.userData.description || 'Описание отсутствует',
      material: object.userData.material,
      dimensions: object.userData.dimensions,
      weight: object.userData.weight,
      documentation: object.userData.documentation,
      groupId: object.userData.groupId
    };

    console.log('📋 Открытие карточки с метаданными:', metadata);
    this.detailCard?.show(metadata);
  }
}