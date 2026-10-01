import * as THREE from 'https://cdn.jsdelivr.net/npm/three@r160/build/three.module.js';

// Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 80, 300);

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 4, -10);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    precision: 'mediump'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
renderer.shadowMap.needsUpdate = true;
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

// Lighting
const ambient = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff4d6, 1.8);
sun.position.set(30, 40, 20);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 500;
sun.shadow.camera.left = -100;
sun.shadow.camera.right = 100;
sun.shadow.camera.top = 100;
sun.shadow.camera.bottom = -100;
scene.add(sun);

// Road Group
const roadGroup = new THREE.Group();
scene.add(roadGroup);

const world = {
    roadWidth: 16,
    totalRoadLength: 600,
    segmentLength: 20,
};

// Create Road
const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x2c3e50,
    roughness: 0.9,
    metalness: 0.1,
});

const shoulderMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a6c7d,
    roughness: 1,
});

const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d7a3d,
    roughness: 1,
});

for (let i = 0; i < world.totalRoadLength / world.segmentLength; i++) {
    const z = -world.totalRoadLength / 2 + i * world.segmentLength;

    // Road surface
    const road = new THREE.Mesh(
        new THREE.BoxGeometry(world.roadWidth, 0.3, world.segmentLength),
        roadMaterial
    );
    road.position.set(0, 0, z);
    road.castShadow = true;
    road.receiveShadow = true;
    roadGroup.add(road);

    // Road shoulders
    const shoulderLeft = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.2, world.segmentLength),
        shoulderMaterial
    );
    shoulderLeft.position.set(-(world.roadWidth / 2 + 1), 0.05, z);
    shoulderLeft.receiveShadow = true;
    roadGroup.add(shoulderLeft);

    const shoulderRight = shoulderLeft.clone();
    shoulderRight.position.x = world.roadWidth / 2 + 1;
    roadGroup.add(shoulderRight);

    // Center line
    if (i % 3 === 0) {
        const line = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.05, 10),
            new THREE.MeshStandardMaterial({
                color: 0xffd700,
                emissive: 0x444400,
            })
        );
        line.position.set(0, 0.2, z);
        roadGroup.add(line);
    }
}

// Ground
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 800),
    grassMaterial
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.2;
ground.receiveShadow = true;
scene.add(ground);

// Car
const car = new THREE.Group();
scene.add(car);

const carBody = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.8, 4),
    new THREE.MeshStandardMaterial({
        color: 0xcc0000,
        metalness: 0.7,
        roughness: 0.2,
    })
);
carBody.position.y = 1.1;
carBody.castShadow = true;
carBody.receiveShadow = true;
car.add(carBody);

const carTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.6, 1.8),
    new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.6,
        roughness: 0.3,
    })
);
carTop.position.set(0, 1.8, -0.2);
carTop.castShadow = true;
car.add(carTop);

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 16);
const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9,
    metalness: 0.2,
});

for (let i = 0; i < 4; i++) {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2;
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    
    const offsetX = i % 2 === 0 ? -1.2 : 1.2;
    const offsetZ = i < 2 ? -1.3 : 1.3;
    wheel.position.set(offsetX, 0.5, offsetZ);
    car.add(wheel);
}

car.position.set(0, 0, 0);

// Input
const input = {
    left: false,
    right: false,
    accel: false,
    brake: false,
};

const carState = {
    speed: 0,
    maxSpeed: 220,
    steering: 0,
    turnRate: 0.06,
    started: false,
};

// UI Elements
const ui = {
    speed: document.getElementById('speed'),
    gear: document.getElementById('gear-panel'),
    overlay: document.getElementById('message-overlay'),
    startBtn: document.getElementById('start-btn'),
};

// Button Handling
function bindButton(elementId, key) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const handleDown = (e) => {
        e.preventDefault();
        input[key] = true;
    };

    const handleUp = (e) => {
        e.preventDefault();
        input[key] = false;
    };

    element.addEventListener('touchstart', handleDown, { passive: false });
    element.addEventListener('touchend', handleUp, { passive: false });
    element.addEventListener('mousedown', handleDown);
    element.addEventListener('mouseup', handleUp);
    element.addEventListener('mouseleave', handleUp);
}

bindButton('left-btn', 'left');
bindButton('right-btn', 'right');
bindButton('acc-btn', 'accel');
bindButton('brake-btn', 'brake');

// Keyboard Input
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') input.accel = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') input.brake = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') input.accel = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') input.brake = false;
});

// Start Button
ui.startBtn.addEventListener('click', () => {
    carState.started = true;
    ui.overlay.classList.add('hidden');
});

// Prevent scrolling on mobile
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('#touch-controls') || e.target.tagName === 'BUTTON') return;
    e.preventDefault();
}, { passive: false });

// Game Update
function updateCar(dt) {
    if (!carState.started) return;

    // Acceleration
    if (input.accel) {
        carState.speed += 50 * dt * 16;
    } else {
        carState.speed -= 12 * dt * 16;
    }

    // Braking
    if (input.brake) {
        carState.speed -= 80 * dt * 16;
    }

    // Speed limits
    carState.speed = Math.max(0, Math.min(carState.speed, carState.maxSpeed));

    // Steering
    const steeringInput = (input.left ? -1 : 0) + (input.right ? 1 : 0);
    car.rotation.y += steeringInput * carState.turnRate * (carState.speed / 80 + 0.15);

    // Lateral movement (drift-like feel)
    const steeringEffect = Math.max(0.1, Math.min(1, carState.speed / 100));
    car.position.x += steeringInput * steeringEffect * 1.5 * dt * 60;
    car.position.x = Math.max(-7, Math.min(7, car.position.x));

    // Forward movement
    const moveForward = carState.speed * dt * 0.32;
    car.position.z -= moveForward;

    // Camera follow
    const targetCameraZ = car.position.z + 9;
    camera.position.x = car.position.x * 0.4;
    camera.position.y = 4.2;
    camera.position.z += (targetCameraZ - camera.position.z) * 0.08;

    camera.lookAt(car.position.x, 1.2, car.position.z - 15);

    // Loop the road
    if (car.position.z < -world.totalRoadLength / 2) {
        car.position.z = world.totalRoadLength / 2 - 10;
    }

    // Update UI
    const speedKmh = Math.round(carState.speed * 3.6);
    ui.speed.textContent = speedKmh;

    if (speedKmh < 40) ui.gear.textContent = 'D';
    else if (speedKmh < 100) ui.gear.textContent = '3';
    else if (speedKmh < 160) ui.gear.textContent = '4';
    else ui.gear.textContent = '5';
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    updateCar(dt);
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Prevent zoom on double-tap
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});