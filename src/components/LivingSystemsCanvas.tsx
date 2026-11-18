import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const _targetPointer = new THREE.Vector2(0, 0);
const _smoothPointer = new THREE.Vector2(0, 0);
const _dummy = new THREE.Object3D();

function detectSoftwareGl(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function LivingSystemsCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSoftwareGl = detectSoftwareGl();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x090d14, 0);

    const canvasEl = renderer.domElement;
    canvasEl.style.width = '100%';
    canvasEl.style.height = '100%';
    canvasEl.style.display = 'block';
    canvasEl.setAttribute('aria-hidden', 'true');
    mountEl.appendChild(canvasEl);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090d14, 0.042);

    const camera = new THREE.PerspectiveCamera(
      46,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.2, 11.5);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // Three-point studio lighting + cool/warm atmosphere
    const hemiLight = new THREE.HemisphereLight(0xb8c5d6, 0x090d14, 0.7);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0x35d6e8, 2.2);
    keyLight.position.set(6, 7, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x8b70ff, 1.5);
    rimLight.position.set(-7, -4, -5);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xb8c5d6, 1.1, 24);
    fillLight.position.set(-4, 4, 5);
    scene.add(fillLight);

    // Composite multi-part Living Systems 3D architectural core
    const systemGroup = new THREE.Group();
    const isDesktop = window.innerWidth >= 1024;
    systemGroup.position.set(isDesktop ? 2.65 : 0, isDesktop ? 0.15 : 1.1, -1.2);
    scene.add(systemGroup);

    // 1. Inner faceted obsidian core
    const coreGeo = new THREE.IcosahedronGeometry(1.18, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x101722,
      metalness: 0.72,
      roughness: 0.26,
      clearcoat: 0.9,
      clearcoatRoughness: 0.14,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    systemGroup.add(coreMesh);

    // 2. Electric cyan structural wireframe shell
    const latticeGeo = new THREE.IcosahedronGeometry(1.72, 1);
    const latticeEdges = new THREE.EdgesGeometry(latticeGeo);
    const latticeMat = new THREE.LineBasicMaterial({
      color: 0x35d6e8,
      transparent: true,
      opacity: 0.34,
    });
    const latticeLines = new THREE.LineSegments(latticeEdges, latticeMat);
    systemGroup.add(latticeLines);

    // 3. Atmospheric violet inner prism octahedron
    const prismGeo = new THREE.OctahedronGeometry(0.62, 0);
    const prismMat = new THREE.MeshStandardMaterial({
      color: 0x8b70ff,
      emissive: 0x8b70ff,
      emissiveIntensity: 0.45,
      metalness: 0.4,
      roughness: 0.3,
      transparent: true,
      opacity: 0.72,
    });
    const prismMesh = new THREE.Mesh(prismGeo, prismMat);
    systemGroup.add(prismMesh);

    // 4. Primary metallic silver gimbal ring
    const ring1Geo = new THREE.TorusGeometry(2.35, 0.024, 14, 96);
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xb8c5d6,
      metalness: 0.92,
      roughness: 0.22,
    });
    const ring1 = new THREE.Mesh(ring1Geo, silverMat);
    ring1.rotation.x = Math.PI * 0.36;
    ring1.rotation.y = Math.PI * 0.15;
    systemGroup.add(ring1);

    // 5. Secondary electric cyan precision orbital ring
    const ring2Geo = new THREE.TorusGeometry(2.85, 0.018, 12, 110);
    const cyanMetalMat = new THREE.MeshStandardMaterial({
      color: 0x35d6e8,
      emissive: 0x35d6e8,
      emissiveIntensity: 0.35,
      metalness: 0.85,
      roughness: 0.18,
    });
    const ring2 = new THREE.Mesh(ring2Geo, cyanMetalMat);
    ring2.rotation.x = -Math.PI * 0.28;
    ring2.rotation.z = Math.PI * 0.22;
    systemGroup.add(ring2);

    // 6. Outer atmospheric violet calibration ring
    const ring3Geo = new THREE.TorusGeometry(3.35, 0.012, 10, 120);
    const violetRingMat = new THREE.MeshStandardMaterial({
      color: 0x8b70ff,
      metalness: 0.78,
      roughness: 0.32,
      transparent: true,
      opacity: 0.65,
    });
    const ring3 = new THREE.Mesh(ring3Geo, violetRingMat);
    ring3.rotation.y = Math.PI * 0.42;
    systemGroup.add(ring3);

    // 7. Instanced orbiting architectural nodes
    const nodeCount = 24;
    const nodeGeo = new THREE.OctahedronGeometry(0.065, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x35d6e8,
      emissive: 0x35d6e8,
      emissiveIntensity: 0.4,
      metalness: 0.6,
      roughness: 0.25,
    });
    const instancedNodes = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    const nodeOrbitData = Array.from({ length: nodeCount }, (_, i) => ({
      radius: 2.0 + (i % 4) * 0.46,
      speed: 0.18 + (i % 5) * 0.06,
      phase: (i / nodeCount) * Math.PI * 2,
      tilt: ((i % 3) - 1) * 0.65,
    }));
    for (let i = 0; i < nodeCount; i++) {
      const d = nodeOrbitData[i];
      _dummy.position.set(
        Math.cos(d.phase) * d.radius,
        Math.sin(d.phase * 1.4) * d.tilt,
        Math.sin(d.phase) * d.radius
      );
      _dummy.scale.setScalar(0.85 + (i % 3) * 0.25);
      _dummy.updateMatrix();
      instancedNodes.setMatrixAt(i, _dummy.matrix);
    }
    instancedNodes.instanceMatrix.needsUpdate = true;
    instancedNodes.computeBoundingSphere();
    instancedNodes.frustumCulled = false;
    systemGroup.add(instancedNodes);

    // 8. Ambient spatial particle field (Electric Cyan + Metallic Silver + Violet)
    const particleCount = 190;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const cCyan = new THREE.Color(0x35d6e8);
    const cSilver = new THREE.Color(0xb8c5d6);
    const cViolet = new THREE.Color(0x8b70ff);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 24;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;

      const palettePick = i % 10;
      const chosen = palettePick < 4 ? cCyan : palettePick < 8 ? cSilver : cViolet;
      particleColors[i * 3] = chosen.r;
      particleColors[i * 3 + 1] = chosen.g;
      particleColors[i * 3 + 2] = chosen.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    scene.add(particleField);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let scrollProgress = 0;
    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    const handlePointerMove = (e: PointerEvent) => {
      _targetPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      _targetPointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      const desktop = w >= 1024;
      systemGroup.position.x = desktop ? 2.65 : 0;
    };

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnavailable(true);
    };

    const handleContextRestored = () => {
      setWebglUnavailable(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize);
    canvasEl.addEventListener('webglcontextlost', handleContextLost);
    canvasEl.addEventListener('webglcontextrestored', handleContextRestored);

    let frameId = 0;
    let disposed = false;
    const timer = new THREE.Timer();
    timer.connect(document);

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const renderFrame = () => {
      if (disposed) return;
      timer.update();
      const delta = Math.min(timer.getDelta(), 0.05);
      const elapsed = timer.getElapsed();

      _smoothPointer.x = THREE.MathUtils.damp(_smoothPointer.x, _targetPointer.x, 3.2, delta);
      _smoothPointer.y = THREE.MathUtils.damp(_smoothPointer.y, _targetPointer.y, 3.2, delta);

      const desktop = window.innerWidth >= 1024;
      const baseX = desktop ? 2.65 - scrollProgress * 1.4 : 0;
      const baseY = (desktop ? 0.15 : 1.1) - scrollProgress * 1.1;

      systemGroup.position.x = THREE.MathUtils.damp(
        systemGroup.position.x,
        baseX + _smoothPointer.x * 0.42,
        2.5,
        delta
      );
      systemGroup.position.y = THREE.MathUtils.damp(
        systemGroup.position.y,
        baseY + _smoothPointer.y * 0.28,
        2.5,
        delta
      );

      if (!prefersReducedMotion) {
        coreMesh.rotation.y = elapsed * 0.18 + _smoothPointer.x * 0.25;
        coreMesh.rotation.x = elapsed * 0.1 + _smoothPointer.y * 0.15;

        latticeLines.rotation.y = -elapsed * 0.12;
        latticeLines.rotation.z = elapsed * 0.08;

        prismMesh.rotation.y = elapsed * 0.35;
        prismMesh.rotation.x = -elapsed * 0.22;

        ring1.rotation.z = elapsed * 0.16;
        ring2.rotation.y = -elapsed * 0.22;
        ring3.rotation.x = elapsed * 0.11;

        for (let i = 0; i < nodeCount; i++) {
          const d = nodeOrbitData[i];
          const angle = d.phase + elapsed * d.speed;
          _dummy.position.set(
            Math.cos(angle) * d.radius,
            Math.sin(angle * 1.4) * d.tilt,
            Math.sin(angle) * d.radius
          );
          _dummy.rotation.y = angle;
          _dummy.scale.setScalar(0.85 + (i % 3) * 0.25);
          _dummy.updateMatrix();
          instancedNodes.setMatrixAt(i, _dummy.matrix);
        }
        instancedNodes.instanceMatrix.needsUpdate = true;

        particleField.rotation.y = elapsed * 0.02 + _smoothPointer.x * 0.04;
        particleField.rotation.x = _smoothPointer.y * 0.03;
      }

      renderer.render(scene, camera);

      if (prefersReducedMotion) return;

      if (isSoftwareGl) {
        afterDraw(renderFrame);
      } else {
        frameId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      canvasEl.removeEventListener('webglcontextlost', handleContextLost);
      canvasEl.removeEventListener('webglcontextrestored', handleContextRestored);

      coreGeo.dispose();
      coreMat.dispose();
      latticeGeo.dispose();
      latticeEdges.dispose();
      latticeMat.dispose();
      prismGeo.dispose();
      prismMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring3Geo.dispose();
      silverMat.dispose();
      cyanMetalMat.dispose();
      violetRingMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      envTexture.dispose();
      timer.dispose();
      renderer.dispose();
      if (canvasEl.parentNode === mountEl) {
        mountEl.removeChild(canvasEl);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Subtle atmospheric lighting backdrop */}
      <div
        className="absolute -top-40 left-[12%] w-[580px] h-[580px] rounded-full opacity-30 blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(53,214,232,0.28) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-[38%] -right-32 w-[540px] h-[540px] rounded-full opacity-25 blur-[150px]"
        style={{ background: 'radial-gradient(circle, rgba(139,112,255,0.28) 0%, transparent 70%)' }}
      />
      <div className="absolute inset-0 living-grid-bg opacity-65" />

      {!webglUnavailable && <div ref={mountRef} className="absolute inset-0" />}
    </div>
  );
}
