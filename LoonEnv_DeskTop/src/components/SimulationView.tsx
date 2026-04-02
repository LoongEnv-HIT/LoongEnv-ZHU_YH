import React from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { Activity } from 'lucide-react';
import loadMujoco from 'mujoco-js';

const SCENE_FILE = 'er15-1400.mjcf.xml';
const MODEL_PUBLIC_ROOT = new URL('robots/er15/', document.baseURI).toString().replace(/\/$/, '');
const SHOWCASE_QPOS = [0.55, -1.18, 1.36, 0.18, 0.92, 0.0];
const ASSET_FILES = [
  'er15-1400.mjcf.xml',
  'b_link.STL',
  'l_1.STL',
  'l_2.STL',
  'l_3.STL',
  'l_4.STL',
  'l_5.STL',
  'l_6.STL',
] as const;

type LoadState = 'loading' | 'ready' | 'error';

type MujocoModel = {
  nbody: number;
  ngeom: number;
  geom_group: Int32Array;
  geom_type: Int32Array;
  geom_size: Float64Array;
  geom_pos: Float64Array;
  geom_quat: Float64Array;
  geom_matid: Int32Array;
  mat_rgba: Float32Array;
  geom_rgba: Float32Array;
  geom_dataid: Int32Array;
  mesh_vertadr: Int32Array;
  mesh_vertnum: Int32Array;
  mesh_faceadr: Int32Array;
  mesh_facenum: Int32Array;
  mesh_vert: Float32Array;
  mesh_face: Int32Array;
  geom_bodyid: Int32Array;
  delete: () => void;
  [key: string]: unknown;
};

type MujocoData = {
  qpos: Float64Array;
  xpos: Float64Array;
  xquat: Float64Array;
  delete: () => void;
  [key: string]: unknown;
};

type MujocoModule = {
  MjModel: { loadFromXML: (path: string) => MujocoModel };
  MjData: new (model: MujocoModel) => MujocoData;
  mj_forward: (model: MujocoModel, data: MujocoData) => void;
  mjtGeom: Record<string, number | { value: number }>;
  MEMFS: unknown;
  FS: {
    mkdir: (path: string) => void;
    mount: (type: unknown, opts: { root: string }, path: string) => void;
    unmount: (path: string) => void;
    writeFile: (path: string, content: string | Uint8Array) => void;
  };
};

function createFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  const tileSize = 64;
  for (let y = 0; y < canvas.height; y += tileSize) {
    for (let x = 0; x < canvas.width; x += tileSize) {
      const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      context.fillStyle = isEven ? '#4d77a8' : '#345f91';
      context.fillRect(x, y, tileSize, tileSize);
    }
  }

  context.strokeStyle = 'rgba(225, 238, 255, 0.64)';
  context.lineWidth = 2.5;
  for (let i = 0; i <= canvas.width; i += tileSize) {
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i, canvas.height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(canvas.width, i);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(18, 18);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildGeom(module: MujocoModule, model: MujocoModel, geomIndex: number) {
  if (model.geom_group?.[geomIndex] === 3) return null;

  const type = model.geom_type[geomIndex];
  const size = model.geom_size.subarray(geomIndex * 3, geomIndex * 3 + 3);
  const pos = model.geom_pos.subarray(geomIndex * 3, geomIndex * 3 + 3);
  const quat = model.geom_quat.subarray(geomIndex * 4, geomIndex * 4 + 4);
  const materialId = model.geom_matid[geomIndex];
  const rgba = materialId >= 0
    ? model.mat_rgba.subarray(materialId * 4, materialId * 4 + 4)
    : model.geom_rgba.subarray(geomIndex * 4, geomIndex * 4 + 4);

  const getEnumValue = (value: unknown) => (value as { value?: number })?.value ?? value;
  const geomTypes = module.mjtGeom;

  let geometry: THREE.BufferGeometry | null = null;

  if (type === getEnumValue(geomTypes.mjGEOM_PLANE)) {
    return null;
  } else if (type === getEnumValue(geomTypes.mjGEOM_BOX)) {
    geometry = new THREE.BoxGeometry(size[0] * 2, size[1] * 2, size[2] * 2);
  } else if (type === getEnumValue(geomTypes.mjGEOM_SPHERE)) {
    geometry = new THREE.SphereGeometry(size[0], 24, 24);
  } else if (type === getEnumValue(geomTypes.mjGEOM_CYLINDER)) {
    geometry = new THREE.CylinderGeometry(size[0], size[0], size[1] * 2, 24);
    geometry.rotateX(Math.PI / 2);
  } else if (type === getEnumValue(geomTypes.mjGEOM_CAPSULE)) {
    geometry = new THREE.CapsuleGeometry(size[0], size[1] * 2, 10, 20);
    geometry.rotateX(Math.PI / 2);
  } else if (type === getEnumValue(geomTypes.mjGEOM_MESH)) {
    const meshId = model.geom_dataid[geomIndex];
    const vertexStart = model.mesh_vertadr[meshId];
    const vertexCount = model.mesh_vertnum[meshId];
    const faceStart = model.mesh_faceadr[meshId];
    const faceCount = model.mesh_facenum[meshId];

    geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(model.mesh_vert.subarray(vertexStart * 3, (vertexStart + vertexCount) * 3), 3),
    );
    geometry.setIndex(Array.from(model.mesh_face.subarray(faceStart * 3, (faceStart + faceCount) * 3)));
    geometry.computeVertexNormals();
  }

  if (!geometry) return null;

  const color = new THREE.Color(rgba[0], rgba[1], rgba[2]);
  const isOrange = color.r > 0.75 && color.g > 0.25 && color.g < 0.62 && color.b < 0.2;
  const isDark = color.r < 0.32 && color.g < 0.34 && color.b < 0.36;

  const material = new THREE.MeshStandardMaterial({
    color,
    transparent: rgba[3] < 1,
    opacity: rgba[3],
    roughness: isOrange ? 0.3 : isDark ? 0.78 : 0.24,
    metalness: isOrange ? 0.16 : isDark ? 0.22 : 0.75,
    emissive: isOrange ? new THREE.Color('#2c1200') : new THREE.Color('#000000'),
    emissiveIntensity: isOrange ? 0.035 : 0,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.quaternion.set(quat[1], quat[2], quat[3], quat[0]);
  return mesh;
}

async function populateVirtualFileSystem(mujoco: MujocoModule) {
  try {
    mujoco.FS.unmount('/working');
  } catch {
    // Ignore when no prior mount exists.
  }
  try {
    mujoco.FS.mkdir('/working');
  } catch {
    // Reuse existing directory.
  }
  mujoco.FS.mount(mujoco.MEMFS, { root: '.' }, '/working');

  for (const file of ASSET_FILES) {
    const response = await fetch(`${MODEL_PUBLIC_ROOT}/${file}`);
    if (!response.ok) {
      throw new Error(`无法加载资源文件: ${file}`);
    }
    const targetPath = `/working/${file}`;
    if (file.endsWith('.xml')) {
      mujoco.FS.writeFile(targetPath, await response.text());
    } else {
      mujoco.FS.writeFile(targetPath, new Uint8Array(await response.arrayBuffer()));
    }
  }
}

export function SimulationView() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [loadState, setLoadState] = React.useState<LoadState>('loading');
  const [statusText, setStatusText] = React.useState('正在初始化 MuJoCo WASM...');
  const [errorText, setErrorText] = React.useState<string | null>(null);

  React.useEffect(() => {
    let disposed = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let controls: OrbitControls | null = null;
    let model: MujocoModel | null = null;
    let data: MujocoData | null = null;
    let moduleInstance: MujocoModule | null = null;
    let animationFrame = 0;

    async function boot() {
      const container = containerRef.current;
      if (!container) return;

      try {
        setLoadState('loading');
        setErrorText(null);
        setStatusText('正在初始化 MuJoCo WASM...');

        moduleInstance = await loadMujoco({
          printErr: (text: string) => {
            if (text && !disposed) {
              setErrorText(text);
            }
          },
        }) as unknown as MujocoModule;
        if (disposed) return;

        setStatusText(`正在载入 ${SCENE_FILE}...`);
        await populateVirtualFileSystem(moduleInstance);
        if (disposed) return;

        setStatusText('正在编译 ER15 模型...');
        model = moduleInstance.MjModel.loadFromXML(`/working/${SCENE_FILE}`);
        data = new moduleInstance.MjData(model);

        SHOWCASE_QPOS.forEach((value, index) => {
          data!.qpos[index] = value;
        });
        moduleInstance.mj_forward(model, data);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#6f95c2');
        scene.fog = new THREE.Fog('#80a2cb', 7, 22);

        const camera = new THREE.PerspectiveCamera(42, container.clientWidth / Math.max(container.clientHeight, 1), 0.01, 100);
        camera.position.set(2.4, -1.8, 1.9);
        camera.up.set(0, 0, 1);
        camera.lookAt(0.3, 0, 0.7);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0.3, 0, 0.7);
        controls.minDistance = 1;
        controls.maxDistance = 8;

        scene.add(new THREE.HemisphereLight(0xdbe9ff, 0x46678f, 0.9));

        const keyLight = new THREE.DirectionalLight(0xfff2d8, 2.2);
        keyLight.position.set(4.1, -3.0, 7.2);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(2048, 2048);
        keyLight.shadow.bias = -0.0002;
        keyLight.shadow.normalBias = 0.02;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 20;
        keyLight.shadow.camera.left = -4;
        keyLight.shadow.camera.right = 4;
        keyLight.shadow.camera.top = 4;
        keyLight.shadow.camera.bottom = -4;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x9dcaff, 0.45);
        fillLight.position.set(-4.2, 2.7, 4.0);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 0.22);
        rimLight.position.set(1.2, 4.5, 3.0);
        scene.add(rimLight);

        const floorTexture = createFloorTexture();
        const floorReflector = new Reflector(new THREE.PlaneGeometry(24, 24), {
          textureWidth: Math.floor(container.clientWidth * Math.min(window.devicePixelRatio, 2)),
          textureHeight: Math.floor(container.clientHeight * Math.min(window.devicePixelRatio, 2)),
          color: 0x5d86b4,
          clipBias: 0.003,
        });
        floorReflector.position.z = -0.003;
        scene.add(floorReflector);

        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(24, 24),
          new THREE.MeshPhysicalMaterial({
            map: floorTexture ?? undefined,
            transparent: true,
            opacity: 0.96,
            roughness: 0.1,
            metalness: 0.06,
            clearcoat: 0.72,
            clearcoatRoughness: 0.14,
            reflectivity: 0.7,
          }),
        );
        floor.position.z = -0.0015;
        floor.receiveShadow = true;
        scene.add(floor);

        const bodies: THREE.Group[] = [];
        for (let bodyIndex = 0; bodyIndex < model.nbody; bodyIndex += 1) {
          const group = new THREE.Group();
          bodies.push(group);
          scene.add(group);
        }

        for (let geomIndex = 0; geomIndex < model.ngeom; geomIndex += 1) {
          const bodyId = model.geom_bodyid[geomIndex];
          const geom = buildGeom(moduleInstance, model, geomIndex);
          if (geom) bodies[bodyId].add(geom);
        }

        const resize = () => {
          if (!renderer) return;
          camera.aspect = container.clientWidth / Math.max(container.clientHeight, 1);
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('resize', resize);
        resize();

        const step = () => {
          if (disposed || !renderer || !controls || !data) return;

          for (let bodyIndex = 0; bodyIndex < bodies.length; bodyIndex += 1) {
            const body = bodies[bodyIndex];
            body.position.set(data.xpos[bodyIndex * 3], data.xpos[bodyIndex * 3 + 1], data.xpos[bodyIndex * 3 + 2]);
            body.quaternion.set(
              data.xquat[bodyIndex * 4 + 1],
              data.xquat[bodyIndex * 4 + 2],
              data.xquat[bodyIndex * 4 + 3],
              data.xquat[bodyIndex * 4],
            );
          }

          controls.update();
          renderer.render(scene, camera);
          animationFrame = window.requestAnimationFrame(step);
        };

        setStatusText('ER15 默认机器人已载入');
        setLoadState('ready');
        step();

        return () => {
          window.removeEventListener('resize', resize);
        };
      } catch (error) {
        if (disposed) return;
        const message = error instanceof Error ? error.message : String(error);
        console.error('SimulationView init error', error);
        setLoadState('error');
        setErrorText(message);
        setStatusText('ER15 初始化失败');
      }
    }

    const resizeCleanupPromise = boot();

    return () => {
      disposed = true;
      void resizeCleanupPromise?.then((cleanup) => cleanup?.());
      window.cancelAnimationFrame(animationFrame);
      controls?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
      data?.delete?.();
      model?.delete?.();
      try {
        moduleInstance?.FS?.unmount('/working');
      } catch {
        // Ignore teardown races.
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#ffffff]">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2 px-2 py-0.5 bg-[#f3f3f3] border border-[#e5e5e5] text-[#333333]">
          <div className={`w-1.5 h-1.5 rounded-full ${loadState === 'error' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider">引擎: MuJoCo WASM</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-0.5 bg-[#f3f3f3] border border-[#e5e5e5] text-[#333333]">
          <Activity className="w-3 h-3 text-blue-600" />
          <span className="text-[10px] font-medium">{statusText}</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="bg-[#f3f3f3] border border-[#e5e5e5] p-2 w-44">
          <p className="text-[9px] font-bold text-[#6f6f6f] uppercase tracking-wider mb-1.5">关节状态 (Joint States)</p>
          <div className="space-y-1">
            {SHOWCASE_QPOS.map((value, index) => {
              const progress = `${Math.min(100, Math.round((Math.abs(value) / Math.PI) * 100))}%`;
              return (
                <div key={`joint-${index + 1}`} className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-[#6f6f6f] w-5">{`J${index + 1}`}</span>
                  <div className="flex-1 h-1 bg-[#e5e5e5] overflow-hidden">
                    <div className="h-full bg-[#007acc]" style={{ width: progress }} />
                  </div>
                  <span className="text-[9px] font-mono text-[#333333]">{value.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex gap-2">
        <div className="bg-[#f3f3f3] border border-[#e5e5e5] px-2 py-1">
          <span className="text-[9px] font-bold text-[#6f6f6f] uppercase tracking-wider mr-2">模型 (MODEL)</span>
          <span className="text-xs font-mono text-[#333333]">ER15-1400</span>
        </div>
        <div className="bg-[#f3f3f3] border border-[#e5e5e5] px-2 py-1">
          <span className="text-[9px] font-bold text-[#6f6f6f] uppercase tracking-wider mr-2">步长 (STEP)</span>
          <span className="text-xs font-mono text-[#333333]">MuJoCo WASM</span>
        </div>
      </div>

      {loadState !== 'ready' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="rounded-xl border border-[#dbe4ee] bg-white px-5 py-4 text-center shadow-sm">
            <div className="text-sm font-semibold text-slate-800">{loadState === 'error' ? 'ER15 加载失败' : '正在加载仿真'}</div>
            <div className="mt-2 max-w-[320px] text-xs font-mono text-slate-500">{errorText ?? statusText}</div>
          </div>
        </div>
      )}
    </div>
  );
}
