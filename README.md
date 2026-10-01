import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ec9ff);
scene.fog = new THREE.Fog(0x8ec9ff, 80, 330);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4.5, -9.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

const ambient = new THREE.HemisphereLight(0xffffff, 0x2a3a34, 1.35);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff2d1, 1.8);
sun.position.set(22, 30, 16);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.left = -80;
sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80;
sun.shadow.camera.bottom = -80;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 350;
scene.add(sun);

// City-like, mountain-like environment.
const environment = new THREE.Group();
scene.add(environment);

for (let i = 0; i < 24; i++) {
  const m = new THREE.Mesh(
    new THREE.ConeGeometry(8 + Math.random() * 10, 18 + Math.random() * 18, 7),
    new THREE.MeshStandardMaterial({ color: 0x6b7d6a, roughness: 1 })
  );
  m.position.set((Math.random() - 0.5) * 260, 0, -220 - i * 30);
  m.castShadow = true;
  m.receiveShadow = true;
  environment.add(m);
}

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 2000),
  new THREE.MeshStandardMaterial({ color: 0x3f8f3d, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.2;
ground.receiveShadow = true;
scene.add(ground);

const roadGroup = new THREE.Group();
scene.add(roadGroup);

const road = {
  width: 16,
  length: 18,
  total: 700,
};

const roadMat = new THREE.MeshStandardMaterial({ color: 0x2b3136, roughness: 0.9, metalness: 0.18 });
const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x5a6167, roughness: 0.95 });

for (let i = 0; i < 42; i++) {
  const z = -road.total / 2 + i * road.length;

  const roadMesh = new THREE.Mesh(new THREE.BoxGeometry(road.width, 0.3, road.length), roadMat);
  roadMesh.position.set(0, 0, z);
  roadMesh.receiveShadow = true;
  roadGroup.add(roadMesh);

  const leftShoulder = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, road.length), shoulderMat);
  leftShoulder.position.set(-(road.width / 2 + 1.4), 0.08, z);
  roadGroup.add(leftShoulder);

  const rightShoulder = leftShoulder.clone();
  rightShoulder.position.x = road.width / 2 + 1.4;
  roadGroup.add(rightShoulder);

  if (i % 2 === 0) {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.05, 8.4),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, emissive: 0x222222 })
    );
    line.position.set(0, 0.18, z);
    roadGroup.add(line);
  }
}

// Trees and roadside props.
for (let i = 0; i < 90; i++) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.28, 1.3, 8),
    new THREE.MeshStandardMaterial({ color: 0x5b3c1b, roughness: 1 })
  );
  trunk.position.y = 0.65;
  tree.add(trunk);

  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x2b8f44, roughness: 1 })
  );
  leaves.position.y = 1.7;
  tree.add(leaves);

  const side = Math.random() > 0.5 ? 1 : -1;
  const x = side * (12 + Math.random() * 26);
  const z = -250 - i * 18 + Math.random() * 12;
  tree.position.set(x, 0, z);
  tree.traverse((obj) => obj.castShadow = true);
  environment.add(tree);
}

const car = new THREE.Group();
scene.add(car);

const baseColor = 0xd92d2d;
const bodyMat = new THREE.MeshStandardMaterial({ color: baseColor, metalness: 0.72, roughness: 0.22 });
const glassMat = new THREE.MeshStandardMaterial({ color: 0x13212d, metalness: 0.45, roughness: 0.1, transparent: true, opacity: 0.9 });

const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 4.6), bodyMat);
chassis.position.y = 1.05;
chassis.castShadow = true;
car.add(chassis);

const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.84, 2.1), glassMat);
cabin.position.set(0, 1.82, -0.15);
cabin.castShadow = true;
car.add(cabin);

const hood = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.35, 1.4), bodyMat);
hood.position.set(0, 1.35, 1.5);
hood.castShadow = true;
car.add(hood);

const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.5), bodyMat);
spoiler.position.set(0, 1.7, -2.15);
car.add(spoiler);

const wheelGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.52, 18);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.9, metalness: 0.2 });

const wheelPositions = [
  [-1.18, 0.5, -1.52],
  [1.18, 0.5, -1.52],
  [-1.18, 0.5, 1.52],
  [1.18, 0.5, 1.52]
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

car.position.set(0, 0, 90);

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
  const el = document.getElementById(id);
  if (!el) return;

  const finish = (e) => {
    e.preventDefault();
    input[key] = false;
  };

  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    input[key] = true;
  });
  el.addEventListener('pointerup', finish);
  el.addEventListener('pointercancel', finish);
  el.addEventListener('pointerleave', finish);
}

bindButton('left-btn', 'left');
bindButton('right-btn', 'right');
bindButton('acc-btn', 'accel');
bindButton('brake-btn', 'brake');

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') input.left = true;
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') input.right = true;
  if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') input.accel = true;
  if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') input.brake = true;
});
window.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') input.left = false;
  if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') input.right = false;
  if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') input.accel = false;
  if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') input.brake = false;
});

ui.startBtn.addEventListener('click', () => {
  state.started = true;
  ui.startScreen.classList.add('hidden');
});

function updateCar(dt) {
  if (!state.started) return;

  // Speed
  if (input.accel) {
    state.speed += 58 * dt * 20;
  } else {
    state.speed -= 14 * dt * 20;
  }

  if (input.brake) {
    state.speed -= 105 * dt * 20;
  }

  state.speed = THREE.MathUtils.clamp(state.speed, 0, state.maxSpeed);

  const steerInput = (input.left ? -1 : 0) + (input.right ? 1 : 0);
  const turnStrength = THREE.MathUtils.clamp(state.speed / 110, 0.15, 1);

  car.rotation.y += steerInput * 0.065 * turnStrength * dt * 60;
  car.position.x += steerInput * 1.7 * turnStrength * dt * 60;
  car.position.x = THREE.MathUtils.clamp(car.position.x, -7.1, 7.1);

  car.position.z -= state.speed * dt * 0.34;
  if (car.position.z < -road.total / 2) {
    car.position.z = road.total / 2 - 12;
  }

  // Wheels spinning.
  wheels.forEach((wheel) => {
    wheel.rotation.x += state.speed * 0.05 * dt * 60;
  });

  // Camera.
  const camTargetZ = car.position.z + 9.8;
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, car.position.x * 0.45, 0.08);
  camera.position.y = THREE.MathUtils.lerp(camera.position.y, 4.5, 0.08);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.08);
  camera.lookAt(car.position.x, 1.4, car.position.z - 14);

  const kph = Math.round(state.speed * 3.6);
  ui.speed.textContent = String(kph);

  if (kph < 35) ui.gear.textContent = 'D';
  else if (kph < 95) ui.gear.textContent = '3';
  else if (kph < 165) ui.gear.textContent = '4';
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

window.addEventListener('contextmenu', (e) => e.preventDefault());
