import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  viewChild,
} from '@angular/core';
import {
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  FogExp2,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three';

@Component({
  selector: 'app-space-scene',
  template: `<canvas #canvas class="scene" aria-hidden="true"></canvas>`,
  styles: `
    :host {
      display: block;
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .scene {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
    }
  `,
})
export class SpaceScene implements OnDestroy {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly zone = inject(NgZone);

  private renderer?: WebGLRenderer;
  private frame = 0;
  private disposed = false;
  private onResize?: () => void;
  private onPointer?: (event: PointerEvent) => void;
  private pointer = { x: 0, y: 0 };

  constructor() {
    afterNextRender(() => this.start());
  }

  ngOnDestroy(): void {
    this.disposed = true;
    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.frame);
    }
    if (typeof window !== 'undefined') {
      if (this.onResize) {
        window.removeEventListener('resize', this.onResize);
      }
      if (this.onPointer) {
        window.removeEventListener('pointermove', this.onPointer);
      }
    }
    this.renderer?.dispose();
  }

  private start(): void {
    const canvas = this.canvas().nativeElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new Scene();
    scene.fog = new FogExp2(0x07101f, 0.055);
    scene.background = new Color(0x07101f);

    const camera = new PerspectiveCamera(55, 1, 0.1, 80);
    camera.position.set(0, 0, 12);

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x07101f, 1);
    this.renderer = renderer;

    const stars = this.createStars();
    scene.add(stars);
    scene.add(new AmbientLight(0x6f86c7, 0.9));
    const blue = new PointLight(0x4c9aff, 18, 40);
    blue.position.set(-4, 3, 6);
    const violet = new PointLight(0x7a5cff, 14, 40);
    violet.position.set(6, -2, 4);
    scene.add(blue, violet);

    const core = new Mesh(
      new IcosahedronGeometry(2.4, 1),
      new MeshPhysicalMaterial({
        color: 0x0c66e4,
        roughness: 0.25,
        metalness: 0.15,
        transmission: 0.65,
        thickness: 1.4,
        transparent: true,
        opacity: 0.55,
        emissive: new Color(0x163a7a),
        emissiveIntensity: 0.45,
      }),
    );
    core.position.set(-5.2, 1.6, -6);
    scene.add(core);

    const cards = this.createCards();
    scene.add(cards);

    const fit = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    fit();
    this.onResize = fit;
    window.addEventListener('resize', fit);

    this.onPointer = (event: PointerEvent) => {
      this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', this.onPointer);

    const tick = (time: number) => {
      if (this.disposed) {
        return;
      }
      const t = time * 0.001;
      stars.rotation.y = t * 0.018;
      stars.rotation.x = t * 0.008;
      core.rotation.x = t * 0.12;
      core.rotation.y = t * 0.18;

      cards.children.forEach((child, index) => {
        const mesh = child as Mesh;
        const phase = index * 0.9;
        mesh.position.y += Math.sin(t * 0.7 + phase) * 0.003;
        mesh.rotation.z = Math.sin(t * 0.4 + phase) * 0.08;
        mesh.rotation.y = Math.sin(t * 0.25 + phase) * 0.15;
      });

      camera.position.x += (this.pointer.x * 1.4 - camera.position.x) * 0.04;
      camera.position.y += (-this.pointer.y * 0.8 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      this.frame = requestAnimationFrame(tick);
    };

    this.zone.runOutsideAngular(() => {
      if (reduced) {
        renderer.render(scene, camera);
        return;
      }
      this.frame = requestAnimationFrame(tick);
    });
  }

  private createStars(): Points {
    const count = 1400;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [new Color(0x9ec5ff), new Color(0xffffff), new Color(0x7a5cff)];

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 4;
      const color = palette[i % palette.length];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    return new Points(
      geometry,
      new PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
  }

  private createCards(): Group {
    const group = new Group();
    const spots = [
      [-6.4, 2.2, -8],
      [-7.1, -1.8, -9],
      [-5.2, -2.8, -7.5],
      [7.4, 3.1, -11],
      [8.2, -2.4, -12],
    ];
    const hues = [0x4c9aff, 0x6e5dc6, 0x22a06b, 0xe56910, 0x0c66e4];

    spots.forEach((spot, index) => {
      const mesh = new Mesh(
        new PlaneGeometry(1.8, 1.15, 1, 1),
        new MeshPhysicalMaterial({
          color: hues[index],
          roughness: 0.35,
          metalness: 0.2,
          transparent: true,
          opacity: 0.28,
          emissive: new Color(hues[index]),
          emissiveIntensity: 0.2,
        }),
      );
      mesh.position.set(spot[0], spot[1], spot[2]);
      mesh.rotation.y = -0.35;
      group.add(mesh);
    });

    return group;
  }
}
