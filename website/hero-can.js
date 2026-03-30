// Hero 3D Can — based on can-viewer
import * as THREE from 'three';

const wrap = document.getElementById('hero-canvas-wrap');
if (!wrap) throw new Error('no hero-canvas-wrap');

const W = () => wrap.clientWidth;
const H = () => wrap.clientHeight;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a3328);

const camera = new THREE.PerspectiveCamera(28, W() / H(), 0.1, 100);
camera.position.set(3.5, 5, 10);
camera.lookAt(0, 1.8, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(W(), H());
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
wrap.appendChild(renderer.domElement);

// Environment
(() => {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x1a3328);
  const add = (c, w, h, p) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.copy(p); m.lookAt(0, 0, 0); envScene.add(m);
  };
  add(0x2a5040, 8, 8, new THREE.Vector3(4, 6, 4));
  add(0x1e3e30, 8, 8, new THREE.Vector3(-5, 4, -2));
  add(0x3a6a54, 10, 6, new THREE.Vector3(0, 3, -6));
  const bounce = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshBasicMaterial({ color: 0x162e22, side: THREE.DoubleSide }));
  bounce.position.set(0, -1, 0); bounce.rotation.x = -Math.PI / 2; envScene.add(bounce);
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();
})();

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.25));

const main = new THREE.DirectionalLight(0xfff8f0, 1.4);
main.position.set(5, 10, 7); main.castShadow = true;
main.shadow.mapSize.set(1024, 1024);
main.shadow.camera.near = 1; main.shadow.camera.far = 30;
main.shadow.camera.left = -6; main.shadow.camera.right = 6;
main.shadow.camera.top = 10; main.shadow.camera.bottom = -2;
main.shadow.bias = -0.0005; main.shadow.normalBias = 0.02;
scene.add(main);

const fill = new THREE.DirectionalLight(0xd0e8dc, 0.3);
fill.position.set(-6, 5, -3); scene.add(fill);

const rim = new THREE.SpotLight(0xffffff, 0.6, 30, Math.PI / 6, 0.5);
rim.position.set(-2, 6, -8); rim.target.position.set(0, 2, 0);
scene.add(rim); scene.add(rim.target);

// Ground
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(14, 64),
  new THREE.MeshStandardMaterial({ color: 0x162e22, roughness: 0.5, metalness: 0 })
);
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01;
ground.receiveShadow = true; scene.add(ground);

// Materials
const BRAND_GREEN = '#2d5a3a';
const BRAND_PINK = '#e8b4b8';
const BRAND_WOOD = '#c4a882';

const canMat = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(BRAND_GREEN), metalness: 0.88, roughness: 0.50,
  clearcoat: 0.15, clearcoatRoughness: 0.08, reflectivity: 0.9, envMapIntensity: 1.2,
});
const lidMat = canMat;
const scoopMat = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color(BRAND_WOOD), metalness: 0.3, roughness: 0.40,
  clearcoat: 0.3, clearcoatRoughness: 0.15, envMapIntensity: 0.8,
});
const interiorMat = new THREE.MeshPhysicalMaterial({ color: 0x222222, roughness: 0.7, metalness: 0.5, side: THREE.BackSide });
const powderMat = new THREE.MeshPhysicalMaterial({
  color: 0x6b8f4e, roughness: 1.0, metalness: 0,
  sheen: 0.3, sheenRoughness: 0.8, sheenColor: new THREE.Color(0x8ab060),
});
const magnetMat = new THREE.MeshPhysicalMaterial({ color: 0x888888, metalness: 0.95, roughness: 0.12, envMapIntensity: 1.5 });
const packingMat = new THREE.MeshPhysicalMaterial({ color: 0x3a3a3a, roughness: 0.9, metalness: 0 });

// Rounded cylinder
function roundedCyl(radius, height, bevel, segs = 64) {
  const br = Math.min(bevel, radius * 0.25, height * 0.25);
  const pts = [];
  const n = 10;
  pts.push(new THREE.Vector2(0, -height / 2));
  pts.push(new THREE.Vector2(radius - br, -height / 2));
  for (let i = 0; i <= n; i++) {
    const a = Math.PI * 1.5 + (Math.PI / 2) * (i / n);
    pts.push(new THREE.Vector2(radius - br + Math.cos(a) * br, -height / 2 + br + Math.sin(a) * br));
  }
  pts.push(new THREE.Vector2(radius, height / 2 - br));
  for (let i = 0; i <= n; i++) {
    const a = (Math.PI / 2) * (i / n);
    pts.push(new THREE.Vector2(radius - br + Math.cos(a) * br, height / 2 - br + Math.sin(a) * br));
  }
  pts.push(new THREE.Vector2(0, height / 2));
  return new THREE.LatheGeometry(pts, segs);
}

// Build can
const canGroup = new THREE.Group();
scene.add(canGroup);
const bodyGroup = new THREE.Group();
const innerLidGroup = new THREE.Group();
const outerLidGroup = new THREE.Group();
canGroup.add(bodyGroup, innerLidGroup, outerLidGroup);

const S = 0.5;
const D = 8.5, HH = 9.0;
const r = (D / 2) * S;
const h = HH * S;
const outerH = 0.22, innerH = 0.12;
const bodyH = h - outerH - innerH;
const bev = 0.05;

// Body
const bodyMesh = new THREE.Mesh(roundedCyl(r, bodyH, bev), canMat);
bodyMesh.castShadow = true; bodyMesh.receiveShadow = true; bodyGroup.add(bodyMesh);
bodyGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(r - 0.05, r - 0.05, bodyH - 0.02, 64, 1, true), interiorMat));
const floor = new THREE.Mesh(new THREE.CircleGeometry(r - 0.05, 64), interiorMat);
floor.rotation.x = Math.PI / 2; floor.position.y = -bodyH / 2 + 0.02; bodyGroup.add(floor);

// Powder
const powH = bodyH * 0.42;
bodyGroup.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(r - 0.055, r - 0.055, powH, 64), powderMat), { position: new THREE.Vector3(0, -bodyH / 2 + 0.02 + powH / 2, 0) }));
const surfM = new THREE.Mesh(new THREE.CircleGeometry(r - 0.055, 64), new THREE.MeshPhysicalMaterial({ color: 0x7aa854, roughness: 1, metalness: 0 }));
surfM.rotation.x = -Math.PI / 2; surfM.position.y = -bodyH / 2 + 0.02 + powH; bodyGroup.add(surfM);

// Lip
const lip = new THREE.Mesh(new THREE.TorusGeometry(r, 0.015, 12, 64), canMat);
lip.rotation.x = Math.PI / 2; lip.position.y = bodyH / 2; bodyGroup.add(lip);
bodyGroup.position.y = bodyH / 2;

// Label
(() => {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 2048, 1024);
  ctx.fillStyle = BRAND_PINK;
  ctx.font = '600 200px "Hiragino Mincho ProN", "Yu Mincho", serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('抹茶', 1024, 380);
  ctx.strokeStyle = BRAND_PINK; ctx.lineWidth = 3; ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(624, 520); ctx.lineTo(1424, 520); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = BRAND_WOOD;
  ctx.font = '300 64px "Helvetica Neue", sans-serif';
  ctx.fillText('M A T C H A', 1024, 620);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const geo = new THREE.CylinderGeometry(r + 0.003, r + 0.003, bodyH * 0.6, 128, 1, true);
  const mat = new THREE.MeshPhysicalMaterial({ map: tex, transparent: true, metalness: 0.15, roughness: 0.35, clearcoat: 0.05 });
  bodyGroup.add(new THREE.Mesh(geo, mat));
})();

// Inner lid
const innerLidMesh = new THREE.Mesh(roundedCyl(r - 0.005, innerH, 0.025), lidMat);
innerLidMesh.castShadow = true; innerLidGroup.add(innerLidMesh);
const pack = new THREE.Mesh(new THREE.TorusGeometry(r - 0.03, 0.018, 12, 64), packingMat);
pack.rotation.x = Math.PI / 2; pack.position.y = -innerH / 2 + 0.01; innerLidGroup.add(pack);

// Scoop
const scoop = new THREE.Group();
const hLen = r * 1.1;
const hShape = new THREE.Shape();
hShape.moveTo(-0.045, 0); hShape.lineTo(0.045, 0); hShape.lineTo(0.032, hLen); hShape.lineTo(-0.032, hLen); hShape.closePath();
const hGeo = new THREE.ExtrudeGeometry(hShape, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3 });
const hMesh = new THREE.Mesh(hGeo, scoopMat);
hMesh.rotation.x = -Math.PI / 2; hMesh.position.set(0, -0.01, hLen / 2); hMesh.castShadow = true;
scoop.add(hMesh);
const bowlPts = [];
for (let i = 0; i <= 24; i++) { const t = i / 24; bowlPts.push(new THREE.Vector2(Math.sin(t * Math.PI) * 0.13, -Math.cos(t * Math.PI) * 0.055)); }
const bowlMesh = new THREE.Mesh(new THREE.LatheGeometry(bowlPts, 32), scoopMat);
bowlMesh.position.set(0, -0.02, -hLen * 0.35); bowlMesh.castShadow = true;
scoop.add(bowlMesh);
scoop.position.y = -innerH / 2 - 0.05;
innerLidGroup.add(scoop);
for (const mz of [-0.12, 0.12]) {
  const mag = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 16), magnetMat);
  mag.position.set(0, -innerH / 2 - 0.006, mz); innerLidGroup.add(mag);
}
innerLidGroup.position.y = bodyH + innerH / 2;

// Outer lid
const outerLidMesh = new THREE.Mesh(roundedCyl(r + 0.012, outerH, bev), lidMat);
outerLidMesh.castShadow = true; outerLidGroup.add(outerLidMesh);
outerLidGroup.add(new THREE.Mesh(
  new THREE.CylinderGeometry(r + 0.005, r + 0.005, outerH - 0.04, 64, 1, true),
  new THREE.MeshPhysicalMaterial({ color: 0x222222, roughness: 0.7, metalness: 0.5, side: THREE.BackSide })
));
outerLidGroup.position.y = bodyH + innerH + outerH / 2;

// Animate
function animate() {
  requestAnimationFrame(animate);
  canGroup.rotation.y += 0.004;
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = W() / H();
  camera.updateProjectionMatrix();
  renderer.setSize(W(), H());
});
