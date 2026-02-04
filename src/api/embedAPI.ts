import { Viewer } from '../core/viewer';

export class EmbedAPI {
  private viewerInstance: Viewer | null = null;
  private viewerOptions: any = {};

  public initViewer(containerId: string): Viewer {
    this.viewerInstance = new Viewer(containerId);
    this.viewerInstance.init();
    return this.viewerInstance;
  }

  public setViewerOptions(options: any): void {
    this.viewerOptions = { ...this.viewerOptions, ...options };
  }

  public getViewerInstance(): Viewer | null {
    return this.viewerInstance;
  }
}