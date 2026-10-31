import * as THREE from '../vendor/three.module.min.js';

// Physical, bevelled device geometry. No model downloads or external services.
export async function mountScene(container, initialKey, callbacks = {}) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: 'low-power'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);
  container.dataset.bufferRetained = String(renderer.getContext().getContextAttributes().preserveDrawingBuffer);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
  camera.position.set(0, .65, 12.4);
  camera.lookAt(0, -.1, 0);
  const rig = new THREE.Group();
  scene.add(rig);
  scene.add(new THREE.HemisphereLight(0xe7e9dc, 0x23362a, 2.1));
  const key = new THREE.DirectionalLight(0xfff3dc, 4.0);
  key.position.set(-5, 7, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 7;
  key.shadow.camera.bottom = -5;
  key.shadow.bias = -.001;
  key.shadow.normalBias = .035;
  key.shadow.radius = 4;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd0e6c3, 2);
  fill.position.set(6, 3, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xd5e6bc, 3.5);
  rim.position.set(1, 4, -4);
  scene.add(rim);
  // A tiny procedural studio environment gives the metal a shared reflection.
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 512;
  envCanvas.height = 256;
  const ctx = envCanvas.getContext('2d');
  ctx.fillStyle = '#333c35';
  ctx.fillRect(0, 0, 512, 256);
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#b8bcb3');
  grad.addColorStop(.45, '#60695e');
  grad.addColorStop(1, '#151c18');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#f6f2e7';
  ctx.fillRect(70, 30, 90, 95);
  ctx.fillStyle = '#a2b8a0';
  ctx.fillRect(330, 30, 50, 140);
  const env = new THREE.CanvasTexture(envCanvas);
  env.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromEquirectangular(env);
  scene.environment = environment.texture;
  env.dispose();
  pmrem.dispose();
  const metal = new THREE.MeshStandardMaterial({
    color: 0x69736a,
    metalness: .85,
    roughness: .31
  });
  const phoneMetal = new THREE.MeshStandardMaterial({
    color: 0x99917a,
    metalness: .9,
    roughness: .28
  });
  const black = new THREE.MeshPhysicalMaterial({
    color: 0x101511,
    roughness: .24,
    metalness: .24,
    clearcoat: .8,
    clearcoatRoughness: .2
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x111813,
    roughness: .5,
    metalness: .2
  });

  function shape(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2,
      y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  function block(w, h, d, r, mat) {
    const g = new THREE.ExtrudeGeometry(shape(w, h, r), {
      depth: d,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: .018,
      bevelThickness: .018,
      curveSegments: 8
    });
    g.translate(0, 0, -d / 2);
    const mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    return mesh;
  }
  const screens = [];

  function screen(group, w, h, x, y, z, type) {
    const geometry = new THREE.PlaneGeometry(w, h);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false
    });
    const base = new THREE.Mesh(geometry, material);
    base.position.set(x, y, z);
    group.add(base);
    const blend = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false
    }));
    blend.position.set(x, y, z + .004);
    blend.visible = false;
    group.add(blend);
    screens.push({
      type,
      base,
      blend
    });
  }
  const monitor = new THREE.Group();
  monitor.position.set(0, .65, 0);
  monitor.rotation.set(-.035, -.19, .015);
  rig.add(monitor);
  monitor.add(block(5.8, 3.8, .18, .14, metal));
  const face = block(5.72, 3.69, .025, .11, black);
  face.position.z = .12;
  monitor.add(face);
  screen(monitor, 5.42, 3.3875, 0, .055, .158, 'desktop');
  const chin = block(5.68, .19, .035, .04, metal);
  chin.position.set(0, -1.77, .16);
  monitor.add(chin);
  const cameraLens = new THREE.Mesh(new THREE.CircleGeometry(.025, 12), dark);
  cameraLens.position.set(0, 1.81, .16);
  monitor.add(cameraLens);
  const neck = block(.44, .9, .22, .035, metal);
  neck.position.set(0, -2.2, -.12);
  neck.rotation.x = -.13;
  monitor.add(neck);
  const foot = block(2.0, .075, 1.0, .07, metal);
  foot.position.set(0, -2.65, .12);
  monitor.add(foot);
  // Phone and tablet are separate objects, with fitted portrait layouts.
  const phone = new THREE.Group();
  phone.position.set(-2.77, -.55, 1.26);
  phone.rotation.set(.04, .1, -.11);
  rig.add(phone);
  phone.add(block(1.32, 2.78, .13, .16, phoneMetal));
  const phoneGlass = block(1.24, 2.69, .028, .13, black);
  phoneGlass.position.z = .085;
  phone.add(phoneGlass);
  screen(phone, 1.15, 2.3, 0, -.015, .14, 'mobile');
  const island = block(.36, .07, .015, .035, dark);
  island.position.set(0, 1.25, .12);
  phone.add(island);
  const home = new THREE.Mesh(new THREE.PlaneGeometry(.36, .018), new THREE.MeshBasicMaterial({
    color: 0xd9dfd5
  }));
  home.position.set(0, -1.27, .12);
  phone.add(home);
  for (const y of [.68, .38]) {
    const button = block(.025, .23, .07, .01, phoneMetal);
    button.position.set(-.68, y, 0);
    phone.add(button);
  }
  const tablet = new THREE.Group();
  tablet.position.set(3.12, .05, -.66);
  tablet.rotation.set(.03, -.25, -.05);
  rig.add(tablet);
  tablet.add(block(2.48, 3.38, .13, .13, metal));
  const tabletGlass = block(2.4, 3.3, .025, .11, black);
  tabletGlass.position.z = .085;
  tablet.add(tabletGlass);
  screen(tablet, 2.22, 2.886, 0, 0, .14, 'tablet');
  const tabletLens = new THREE.Mesh(new THREE.CircleGeometry(.018, 10), dark);
  tabletLens.position.set(0, 1.57, .12);
  tablet.add(tabletLens);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({
    opacity: .1
  }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.08;
  floor.receiveShadow = true;
  scene.add(floor);

  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sc = shadowCanvas.getContext('2d');
  const sg = sc.createRadialGradient(64, 64, 4, 64, 64, 64);
  sg.addColorStop(0, 'rgba(0,0,0,.38)');
  sg.addColorStop(.45, 'rgba(0,0,0,.16)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  sc.fillStyle = sg;
  sc.fillRect(0, 0, 128, 128);
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const softShadow = new THREE.Mesh(new THREE.PlaneGeometry(9, 4), new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false
  }));
  softShadow.rotation.x = -Math.PI / 2;
  softShadow.position.set(0, -2.06, .15);
  scene.add(softShadow);
  for (const [x, z, w, h] of [
      [-2.7, 1.2, 2, 1.5],
      [3.1, -.6, 3, 1.6]
    ]) {
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w, h), softShadow.material);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, -2.045, z);
    scene.add(shadow);
  }
  const cache = new Map();
  const loader = new THREE.TextureLoader();
  let selectionToken = 0,
    blendStart = 0,
    transitioning = false;
  async function textures(id) {
    if (cache.has(id)) return cache.get(id);
    const pending = Promise.all(['desktop', 'mobile', 'tablet'].map(async type => {
      const t = await loader.loadAsync(`assets/images/screens/${id}-${type}.webp`);
      if (innerWidth <= 800) {
        const limit = type === 'desktop' ? 1024 : type === 'tablet' ? 768 : 512;
        if (t.image.width > limit) {
          const c = document.createElement('canvas');
          c.width = limit;
          c.height = Math.round(t.image.height * limit / t.image.width);
          c.getContext('2d').drawImage(t.image, 0, 0, c.width, c.height);
          t.image = c;
          t.needsUpdate = true;
        }
      }
      t.userData.source = id + '-' + type;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      return [type, t];
    })).then(pairs => Object.fromEntries(pairs));
    cache.set(id, pending);
    try {
      return await pending;
    } catch (error) {
      cache.delete(id);
      throw error;
    }
  }
  let reduced = Boolean(callbacks.motionReduced),
    paused = false,
    visible = true,
    lost = false,
    frame = 0,
    progress = 0,
    lastTime = 0,
    elapsed = 0;
  let pointerX = 0,
    pointerY = 0,
    smoothX = 0,
    smoothY = 0;
  const started = performance.now();

  function finishBlend() {
    screens.forEach(s => {
      s.base.material.map = s.blend.material.map;
      s.base.material.needsUpdate = true;
      s.blend.visible = false;
      s.blend.material.opacity = 0;
    });
    transitioning = false;
    container.dataset.screens = screens.map(s => s.base.material.map?.userData.source || '').join('|');
  }
  async function select(id, instant = false) {
    const token = ++selectionToken;
    const maps = await textures(id);
    if (token !== selectionToken) return;
    if (transitioning) finishBlend();
    screens.forEach(s => {
      if (instant || reduced || !s.base.material.map) {
        s.base.material.map = maps[s.type];
        s.base.material.needsUpdate = true;
      } else {
        s.blend.material.map = maps[s.type];
        s.blend.material.needsUpdate = true;
        s.blend.material.opacity = 0;
        s.blend.visible = true;
      }
    });
    if (!instant && !reduced) {
      blendStart = performance.now();
      transitioning = true;
    }
    if (instant || reduced) container.dataset.screens = screens.map(s => s.base.material.map?.userData.source || '').join('|');
    callbacks.onSelection?.(id);
    wake();
  }

  function resize() {
    const w = container.clientWidth,
      h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = Math.max(9.2, 16.9 / camera.aspect);
    camera.updateProjectionMatrix();
    if (!lost) renderer.render(scene, camera);
    wake();
  }

  function wake() {
    if (!frame && !lost && visible && !document.hidden) frame = requestAnimationFrame(render);
  }

  function render(now) {
    frame = 0;
    if (lost || !visible || document.hidden) return;
    const dt = Math.min((now - lastTime) / 1000, .04);
    lastTime = now;
    if (!reduced && !paused) elapsed += dt;
    smoothX += (pointerX - smoothX) * .07;
    smoothY += (pointerY - smoothY) * .07;
    const intro = reduced ? 1 : Math.min((now - started) / 1500, 1);
    const settle = 1 - Math.pow(1 - intro, 3);
    rig.position.y = (1 - settle) * -.5;
    rig.rotation.y = reduced ? 0 : smoothX * .065;
    rig.rotation.x = reduced ? 0 : smoothY * .025;
    rig.scale.setScalar(.94 + .06 * settle + progress * .04);
    const drift = reduced ? 0 : Math.sin(elapsed * .72) * .035;
    monitor.position.y = .65 + drift;
    phone.position.y = -.55 + (reduced ? 0 : Math.sin(elapsed * .85 + 1.2) * .055);
    tablet.position.y = .05 - drift;
    phone.rotation.y = .1 + (reduced ? 0 : smoothX * .055);
    phone.rotation.z = -.11 + (reduced ? 0 : Math.sin(elapsed * .5) * .012);
    key.position.x = -5 + (reduced ? 0 : smoothX * 1.3);
    fill.position.z = 2 + (reduced ? 0 : smoothY);
    if (transitioning) {
      const a = Math.min((now - blendStart) / 650, 1);
      screens.forEach(s => s.blend.material.opacity = a * a * (3 - 2 * a));
      if (a === 1) finishBlend();
    }
    renderer.render(scene, camera);
    if ((!reduced && !paused) || transitioning || intro < 1 || Math.abs(pointerX - smoothX) > .001 || Math.abs(pointerY - smoothY) > .001) wake();
  }
  container.addEventListener('pointermove', event => {
    if (reduced || paused || event.pointerType === 'touch') return;
    const rect = container.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width * 2 - 1;
    pointerY = (event.clientY - rect.top) / rect.height * 2 - 1;
    container.style.setProperty('--pointer-x', pointerX.toFixed(3));
    container.style.setProperty('--pointer-y', pointerY.toFixed(3));
    wake();
  });
  container.addEventListener('pointerleave', () => {
    pointerX = pointerY = 0;
    wake();
  });
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    container.classList.remove('is-ready');
    container.classList.add('scene-failed');
    callbacks.onFailure?.('Graphics context lost; static preview is active.');
  });
  document.addEventListener('visibilitychange', () => {
    lastTime = performance.now();
    wake();
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    lastTime = performance.now();
    if (visible) wake();
  }, {
    threshold: .01
  }).observe(container);
  new ResizeObserver(resize).observe(container);
  try {
    await select(initialKey, true);
  } catch (error) {
    lost = true;
    cancelAnimationFrame(frame);
    renderer.dispose();
    renderer.domElement.remove();
    throw error;
  }
  resize();
  renderer.render(scene, camera);
  container.classList.add('is-ready');
  callbacks.onReady?.();
  wake();
  return {
    select,
    loseContext() {
      renderer.forceContextLoss();
    },
    setProgress(value) {
      progress = value;
      wake();
    },
    setMotion(value) {
      reduced = value;
      if (value) {
        pointerX = pointerY = smoothX = smoothY = 0;
        if (transitioning) finishBlend();
      }
      wake();
    },
    setPaused(value) {
      paused = value;
      if (value) pointerX = pointerY = 0;
      wake();
    },
    getState() {
      return {
        reduced,
        paused,
        progress,
        visible,
        transitioning,
        renderer: 'Three.js WebGL',
        selected: container.dataset.selected
      };
    }
  };
}
