import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Controls } from '../interactions/controls';
import { PartSelection } from '../interactions/partSelection';
import { CameraFocus } from '../interactions/cameraFocus';
import { AnimationLoader } from '../loaders/animationLoader';
import { AnimationPanel } from '../ui/animationPanel';
import { Timeline } from '../ui/timeline';
import { DetailCard } from '../ui/detailCard';
import { PartMetadata } from '../types';

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

  private hoveredMeshes: Set<THREE.Mesh> = new Set();
  private selectedMeshes: Set<THREE.Mesh> = new Set();

  private hoverColor = new THREE.Color(0x667eea);
  private selectColor = new THREE.Color(0x3cb371);

  constructor(containerId: string) {
    this.containerId = containerId;
    console.log('Viewer constructor called');
  }

  public init(): void {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      throw new Error(`Container with id "${this.containerId}" not found`);
    }
    console.log('1. Container found:', this.container);

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    console.log('2. Container size:', width, 'x', height);

    this.scene = new THREE.Scene();
    console.log('3. Scene created');

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(5, 5, 5);
    console.log('4. Camera created');

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
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

    // Инициализация UI
    this.initUI();

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

    // Play/Pause
    this.animationPanel?.onPlay(() => {
      this.togglePlayPause();
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
            
            // ✅ Автозапуск первой анимации
            this.playAnimation('assembly');
          }
          
          this.fitCameraToModel(gltf.scene);
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

  private handleSingleClick(object: THREE.Object3D): void {
    console.log('👆 Одинарный клик:', object.name);
    this.cameraFocus?.focusOn(object);
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
    console.log('📋 Карточка должна быть видна');
  }

  private clearSelection(): void {
    console.log('🔄 Сброс выбора');
    this.detailCard?.hide();
    this.cameraFocus?.reset();
    this.setSelectedObject(null);
  }
}