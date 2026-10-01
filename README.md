import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ec9ff);
scene.fog = new THREE.Fog(0x8ec9ff, 90, 340);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 1200);
camera.position.set(0, 4.5, -10);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

const hemi = new THREE.HemisphereLight(0xffffff, 0x2b3d3c, 1.35);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff1c9, 1.8);
sun.position.set(20, 28, 12);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.left = -90;
sun.shadow.camera.right = 90;
sun.shadow.camera.top = 90;
sun.shadow.camera.bottom = -90;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 350;
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

for (let i = 0; i < 30; i++) {
  const m = new THREE.Mesh(
    new THREE.ConeGeometry(8 + Math.random() * 10, 18 + Math.random() * 22, 8),
    new THREE.MeshStandardMaterial({ color: 0x6a775f, roughness: 1 })
  );
  m.position.set((Math.random() - 0.5) * 260, 0, -180 - i * 20);
  m.castShadow = true;
  m.receiveShadow = true;
  world.add(m);
}

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 2200),
  new THREE.MeshStandardMaterial({ color: 0x3b8735, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.2;
ground.receiveShadow = true;
scene.add(ground);

const roadGroup = new THREE.Group();
scene.add(roadGroup);

const roadCfg = { width: 16, segment: 18, total: 700 };
const roadMat = new THREE.MeshStandardMaterial({ color: 0x2c333a, roughness: 0.9, metalness: 0.2 });
const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x58666d, roughness: 1 });

for (let i = 0; i < 42; i++) {
  const z = -roadCfg.total / 2 + i * roadCfg.segment;

  const roadMesh = new THREE.Mesh(new THREE.BoxGeometry(roadCfg.width, 0.3, roadCfg.segment), roadMat);
  roadMesh.position.set(0, 0, z);
  roadMesh.receiveShadow = true;
  roadGroup.add(roadMesh);

  const leftShoulder = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, roadCfg.segment), shoulderMat);
  leftShoulder.position.set(-roadCfg.width / 2 - 1.3, 0.08, z);
  roadGroup.add(leftShoulder);

  const rightShoulder = leftShoulder.clone();
  rightShoulder.position.x = roadCfg.width / 2 + 1.3;
  roadGroup.add(rightShoulder);

  if (i % 2 === 0) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.05, 8.5),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, emissive: 0x333333 })
    );
    line.position.set(0, 0.18, z);
    roadGroup.add(line);
  }
}

for (let i = 0; i < 120; i++) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.24, 1.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x5d3a1d, roughness: 1 })
  );
  trunk.position.y = 0.6;
  tree.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x2c9246, roughness: 1 })
  );
  leaves.position.y = 1.7;
  tree.add(leaves);

  const side = Math.random() > 0.5 ? 1 : -1;
  const x = side * (12 + Math.random() * 28);
  const z = -230 - i * 15 + Math.random() * 12;
  tree.position.set(x, 0, z);
  tree.traverse((obj) => (obj.castShadow = true));
  world.add(tree);
}

const car = new THREE.Group();
scene.add(car);

const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd4002a, metalness: 0.75, roughness: 0.22 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x12212e, metalness: 0.5, roughness: 0.12, transparent: true, opacity: 0.95 });

const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 4.7), bodyMat);
chassis.position.y = 1.02;
chassis.castShadow = true;
car.add(chassis);

const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.75, 2.0), glassMat);
cabin.position.set(0, 1.72, -0.12);
cabin.castShadow = true;
car.add(cabin);

const hood = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.35, 1.4), bodyMat);
hood.position.set(0, 1.36, 1.5);
hood.castShadow = true;
car.add(hood);

const rear = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 0.8), bodyMat);
rear.position.set(0, 1.25, -2.3);
rear.castShadow = true;
car.add(rear);

const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.4), bodyMat);
spoiler.position.set(0, 1.7, -2.2);
car.add(spoiler);

const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.52, 18);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.9, metalness: 0.2 });
const wheelPositions = [
  [-1.18, 0.5, -1.55],
  [1.18, 0.5, -1.55],
  [-1.18, 0.5, 1.55],
  [1.18, 0.5, 1.55],
];
const wheels = [];
for (const [x, y, z] of wheelPositions) {
  const wheel = new THREE.Mesh(wheelGeo, wheelMat);
  wheel.rotation.z = Math.PI / 2;
  wheel.position.set(x, y, z);
  wheel.castShadow = true;
  wheel.receiveShadow = true;
  car.add(wheel);
  wheels.push(wheel);
}

car.position.set(0, 0, 80);

const input = {
  left: false,
  right: false,
  accel: false,
  brake: false,
};

const state = {
  speed: 0,
  maxSpeed: 260,
  started: false,
};

const ui = {
  speed: document.getElementById('speed'),
  gear: document.getElementById('gear-panel'),
  startScreen: document.getElementById('start-screen'),
  startBtn: document.getElementById('start-btn'),
};

function bindButton(id, key) {
  const element = document.getElementById(id);
  if (!element) return;

  const end = (event) => {
    event.preventDefault();
    input[key] = false;
  };

  element.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    input[key] = true;
  });
  element.addEventListener('pointerup', end);
  element.addEventListener('pointerleave', end);
  element.addEventListener('pointercancel', end);
}

bindButton('left-btn', 'left');
bindButton('right-btn', 'right');
bindButton('acc-btn', 'accel');
bindButton('brake-btn', 'brake');

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (event.key === 'ArrowLeft' || key === 'a') input.left = true;
  if (event.key === 'ArrowRight' || key === 'd') input.right = true;
  if (event.key === 'ArrowUp' || key === 'w') input.accel = true;
  if (event.key === 'ArrowDown' || key === 's') input.brake = true;
});

window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  if (event.key === 'ArrowLeft' || key === 'a') input.left = false;
  if (event.key === 'ArrowRight' || key === 'd') input.right = false;
  if (event.key === 'ArrowUp' || key === 'w') input.accel = false;
  if (event.key === 'ArrowDown' || key === 's') input.brake = false;
});

ui.startBtn.addEventListener('click', () => {
  state.started = true;
  ui.startScreen.classList.add('hidden');
});

function updateCar(dt) {
  if (!state.started) return;

  const accelForce = input.accel ? 60 : 0;
  const brakeForce = input.brake ? 110 : 0;

  if (input.accel) {
    state.speed += accelForce * dt * 20;
  } else {
    state.speed -= 16 * dt * 20;
  }

  if (input.brake) {
    state.speed -= brakeForce * dt * 20;
  }

  state.speed = THREE.MathUtils.clamp(state.speed, 0, state.maxSpeed);

  const steerInput = (input.left ? -1 : 0) + (input.right ? 1 : 0);
  const turnStrength = THREE.MathUtils.clamp(state.speed / 110, 0.2, 1);

  car.rotation.y += steerInput * 0.065 * turnStrength * dt * 60;
  car.position.x += steerInput * 1.8 * turnStrength * dt * 60;
  car.position.x = THREE.MathUtils.clamp(car.position.x, -7.25, 7.25);

  car.position.z -= state.speed * dt * 0.34;
  if (car.position.z < -roadCfg.total / 2) {
    car.position.z = roadCfg.total / 2 - 10;
  }

  wheels.forEach((wheel) => {
    wheel.rotation.x += state.speed * 0.05 * dt * 60;
  });

  const camTargetZ = car.position.z + 9.5;
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, car.position.x * 0.45, 0.08);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, 4.6, 0.08);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.08);
  camera.lookAt(car.position.x, 1.2, car.position.z - 15);

  const kph = Math.round(state.speed * 3.6);
  ui.speed.textContent = String(kph);

  if (kph < 35) ui.gear.textContent = 'D';
  else if (kph < 90) ui.gear.textContent = '3';
  else if (kph < 160) ui.gear.textContent = '4';
  else ui.gear.textContent = '5';
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  updateCar(dt);
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('contextmenu', (event) => event.preventDefault());

window.addEventListener('touchmove', (event) => {
  if (!event.target.closest('button')) event.preventDefault();
}, { passive: false });
