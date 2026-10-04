/* 3D shape viewers (needs three.js r128 loaded first) */

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function makeViewer(el, tilt) {
  if (typeof THREE === "undefined") {
    el.insertAdjacentHTML("afterbegin",
      '<p style="padding:20px;text-align:center">The 3D viewer needs the three.js library. ' +
      'Connect to the internet or save three.min.js into static/js/ (see README).</p>');
    return null;
  }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 1.5, 12);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.display = "block";
  el.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const sun = new THREE.DirectionalLight(0xffffff, 0.7);
  sun.position.set(4, 8, 6);
  scene.add(sun);

  const pivot = new THREE.Group();
  pivot.rotation.x = tilt;
  scene.add(pivot);

  let auto = true, dragging = false, lx = 0, ly = 0;
  el.addEventListener("pointerdown", e => {
    dragging = true; auto = false; lx = e.clientX; ly = e.clientY;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener("pointermove", e => {
    if (!dragging) return;
    pivot.rotation.y += (e.clientX - lx) * 0.01;
    pivot.rotation.x = clamp(pivot.rotation.x + (e.clientY - ly) * 0.01, -1.4, 1.4);
    lx = e.clientX; ly = e.clientY;
  });
  const stop = () => { dragging = false; };
  el.addEventListener("pointerup", stop);
  el.addEventListener("pointercancel", stop);

  function resize() {
    const w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  (function loop() {
    requestAnimationFrame(loop);
    if (auto && !reduce) pivot.rotation.y += 0.006;
    renderer.render(scene, camera);
  })();

  return {
    show(group) {
      while (pivot.children.length) {
        const old = pivot.children.pop();
        old.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      }
      pivot.add(group);
    }
  };
}

function brickMat(color) { return new THREE.MeshLambertMaterial({ color: color }); }
function outline(mesh) {
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: 0x1b1b1b }));
}

/* ---------- Circle: a yellow round plate with a red radius bar ---------- */
function buildCircle(r) {
  const R = clamp(r * 0.3, 0.5, 3.2);
  const g = new THREE.Group();

  const disc = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.5, 64), brickMat(0xFFD500));
  g.add(disc, outline(disc));

  const bar = new THREE.Mesh(new THREE.BoxGeometry(R, 0.08, 0.14), brickMat(0xD01012));
  bar.position.set(R / 2, 0.3, 0);
  g.add(bar);

  const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 24), brickMat(0x0055BF));
  dot.position.set(0, 0.3, 0);
  g.add(dot);
  return g;
}

function initCircle(viewerId, inputId) {
  const v = makeViewer(document.getElementById(viewerId), 0.7);
  if (!v) return;
  const input = document.getElementById(inputId);
  const update = () => v.show(buildCircle(parseFloat(input.value) || 5));
  input.addEventListener("input", update);
  update();
}

/* ---------- Triangle: a blue prism, base + height bars, grey rectangle ---------- */
function buildTriangle(b, h) {
  const B = clamp(b * 0.3, 0.8, 4.2), H = clamp(h * 0.3, 0.8, 4.2), D = 0.5;
  const g = new THREE.Group();

  const shape = new THREE.Shape();
  shape.moveTo(-B / 2, -H / 2);
  shape.lineTo(B / 2, -H / 2);
  shape.lineTo(0, H / 2);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: false });
  geo.translate(0, 0, -D / 2);
  const prism = new THREE.Mesh(geo, brickMat(0xFFD500));
  g.add(prism, outline(prism));

  const front = D / 2 + 0.05;
  const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.1, H, 0.1), brickMat(0xD01012));
  hBar.position.set(0, 0, front);
  const bBar = new THREE.Mesh(new THREE.BoxGeometry(B, 0.1, 0.1), brickMat(0x0055BF));
  bBar.position.set(0, -H / 2, front);
  g.add(hBar, bBar);

  const ghost = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(B, H, D)),
    new THREE.LineBasicMaterial({ color: 0x888888 }));
  g.add(ghost);
  return g;
}

function initTriangle(viewerId, baseId, heightId) {
  const v = makeViewer(document.getElementById(viewerId), 0.15);
  if (!v) return;
  const bi = document.getElementById(baseId), hi = document.getElementById(heightId);
  const update = () => v.show(buildTriangle(parseFloat(bi.value) || 6, parseFloat(hi.value) || 4));
  bi.addEventListener("input", update);
  hi.addEventListener("input", update);
  update();
}
