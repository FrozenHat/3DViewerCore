import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

export class ModelLoader {
  private loader: GLTFLoader = new GLTFLoader();

  public load(
    url: string,
    onLoad: (gltf: any) => void,
    onProgress: (progress: ProgressEvent) => void,
    onError: (error: any) => void
  ): void {
    this.loader.load(url, onLoad, onProgress, onError);
  }
}