import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const THEME_STORAGE_KEY = "aniloom-theme";
const getStoredValue = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const initScene = () => {
  const canvas = document.getElementById("scene-canvas");
  if (!canvas) return;
  const sceneLayerEl = document.querySelector(".scene-layer");
  if (sceneLayerEl) {
    sceneLayerEl.classList.add("scene-layer--ready");
  }

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 5, 20);

  const ambientLight = new THREE.AmbientLight(0x9bb0ff, 0.6);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xdde4ff, 1.2);
  keyLight.position.set(6, 12, 10);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x4c66aa, 0.5);
  fillLight.position.set(-10, 6, -6);
  scene.add(fillLight);

  const goldenRatio = 1.618;
  const rainbowColorSpeed = 0.05;

  const domeMaterials = [];
  const accentGridMaterials = [];
  const connectionMeshes = [];
  const cloudGroups = [];
  const cloudMaterials = [];
  const domeGroups = [];
  const tempVectorA = new THREE.Vector3();
  const tempVectorB = new THREE.Vector3();
  const tempVectorC = new THREE.Vector3();
  const stopMetrics = [];

  const sharedGlassMaterial = () =>
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x84b4ff),
      roughness: 0.08,
      metalness: 0.08,
      transmission: 0.72,
      thickness: 1.2,
      transparent: true,
      opacity: 0.22,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
      depthWrite: false,
    });

  const createFaceMaterial = (color) =>
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

  const createFrameMaterial = (color, opacity = 0.95) =>
    new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

  const createNodeMaterial = (color) =>
    new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.19,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

  const createCloudTexture = () => {
    const size = 256;
    const cloudCanvas = document.createElement("canvas");
    cloudCanvas.width = size;
    cloudCanvas.height = size;
    const context = cloudCanvas.getContext("2d");
    if (!context) return null;

    const gradient = context.createRadialGradient(
      size * 0.5,
      size * 0.46,
      size * 0.08,
      size * 0.5,
      size * 0.5,
      size * 0.5
    );
    gradient.addColorStop(0, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.35, "rgba(232,242,255,0.72)");
    gradient.addColorStop(0.7, "rgba(189,213,255,0.22)");
    gradient.addColorStop(1, "rgba(189,213,255,0)");

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(size * 0.5, size * 0.5, size * 0.5, 0, Math.PI * 2);
    context.fill();

    const texture = new THREE.CanvasTexture(cloudCanvas);
    texture.needsUpdate = true;
    return texture;
  };

  const cloudTexture = createCloudTexture();

  const registerAccentGridMaterial = (
    faceMaterial,
    lineMaterial,
    nodeMaterial,
    baseHue,
    luminance,
    phase
  ) => {
    accentGridMaterials.push({
      faceMaterial,
      lineMaterial,
      nodeMaterial,
      baseHue,
      luminance,
      phase,
    });
  };

  const createGridObject = (
    geometry,
    {
      faceColor = 0x69b8ff,
      lineColor = 0x8fd0ff,
      nodeColor = 0xd8fbff,
      faceOpacity = 0.1,
      lineOpacity = 0.9,
      nodeOpacity = 0.9,
      nodeSize = 0.17,
      baseHue = 0.58,
      luminance = 0.62,
      phase = 0,
    } = {}
  ) => {
    const group = new THREE.Group();
    const faceMaterial = createFaceMaterial(faceColor);
    faceMaterial.opacity = faceOpacity;

    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const lineMaterial = createFrameMaterial(lineColor, lineOpacity);
    const wireframe = new THREE.LineSegments(wireframeGeometry, lineMaterial);
    group.add(wireframe);

    const uniqueVertices = [];
    const seen = new Set();
    const positions = geometry.getAttribute("position");
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const key = `${x.toFixed(3)}:${y.toFixed(3)}:${z.toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      uniqueVertices.push(x, y, z);
    }

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(uniqueVertices, 3)
    );
    const nodeMaterial = createNodeMaterial(nodeColor);
    nodeMaterial.opacity = nodeOpacity;
    nodeMaterial.size = nodeSize;
    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);

    const faceMesh = new THREE.Mesh(geometry, faceMaterial);
    faceMesh.renderOrder = 1;

    group.add(faceMesh);
    group.add(nodes);

    registerAccentGridMaterial(
      faceMaterial,
      lineMaterial,
      nodeMaterial,
      baseHue,
      luminance,
      phase
    );

    return group;
  };

  const createDomeFrame = (radius, widthSegments, heightSegments) => {
    const frameGroup = new THREE.Group();
    const frameGeometry = new THREE.SphereGeometry(
      radius * 1.002,
      widthSegments,
      heightSegments,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );

    const wireframe = new THREE.LineSegments(
      new THREE.WireframeGeometry(frameGeometry),
      createFrameMaterial(0x8fd0ff)
    );
    frameGroup.add(wireframe);

    const uniqueVertices = [];
    const seen = new Set();
    const positions = frameGeometry.getAttribute("position");
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const key = `${x.toFixed(3)}:${y.toFixed(3)}:${z.toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      uniqueVertices.push(x, y, z);
    }

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(uniqueVertices, 3)
    );

    const nodes = new THREE.Points(nodeGeometry, createNodeMaterial(0xd8fbff));
    frameGroup.add(nodes);

    frameGroup.rotation.x = Math.PI;
    frameGroup.renderOrder = 3;
    return {
      frameGroup,
      lineMaterial: wireframe.material,
      nodeMaterial: nodes.material,
    };
  };

  const registerDomeMaterial = (
    faceMaterial,
    shellMaterial,
    lineMaterial,
    nodeMaterial,
    baseHue,
    luminance,
    phase
  ) => {
    domeMaterials.push({
      faceMaterial,
      shellMaterial,
      lineMaterial,
      nodeMaterial,
      baseHue,
      luminance,
      phase,
    });
    return { faceMaterial, shellMaterial, lineMaterial, nodeMaterial };
  };

  const createCore = (radius, colorPhase) => {
    const group = new THREE.Group();
    domeGroups.push({ group, baseY: 0, phase: colorPhase, drift: 0.14 });

    const shellGeometry = new THREE.SphereGeometry(
      radius * 0.985,
      80,
      80,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const faceGeometry = new THREE.SphereGeometry(
      radius * 0.998,
      24,
      18,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const domeFrame = createDomeFrame(radius, 13, 10);
    const domeVisual = registerDomeMaterial(
      createFaceMaterial(0x69b8ff),
      sharedGlassMaterial(),
      domeFrame.lineMaterial,
      domeFrame.nodeMaterial,
      0.55,
      0.58,
      colorPhase
    );

    const shell = new THREE.Mesh(shellGeometry, domeVisual.shellMaterial);
    shell.rotation.x = Math.PI;
    group.add(shell);

    const face = new THREE.Mesh(faceGeometry, domeVisual.faceMaterial);
    face.rotation.x = Math.PI;
    face.renderOrder = 2;
    group.add(face);
    group.add(domeFrame.frameGroup);

    const inner = createGridObject(
      new THREE.SphereGeometry(radius * 0.32, 20, 16),
      {
        faceColor: 0x8fdcff,
        lineColor: 0xaee7ff,
        nodeColor: 0xe8fdff,
        faceOpacity: 0.16,
        nodeSize: 0.16,
        baseHue: 0.53,
        luminance: 0.68,
        phase: colorPhase + 0.08,
      }
    );
    inner.position.y = radius * 0.35;
    group.add(inner);

    const basePlate = createGridObject(
      new THREE.CircleGeometry(radius * 0.95, 24),
      {
        faceColor: 0x4f77bd,
        lineColor: 0x8ab8ff,
        nodeColor: 0xcbe2ff,
        faceOpacity: 0.09,
        nodeSize: 0.12,
        baseHue: 0.6,
        luminance: 0.58,
        phase: colorPhase + 0.15,
      }
    );
    basePlate.rotation.x = -Math.PI / 2;
    basePlate.position.y = -radius * 0.02;
    group.add(basePlate);

    return group;
  };

  const createSatellite = (radius, colorPhase) => {
    const group = new THREE.Group();

    const shellGeometry = new THREE.SphereGeometry(
      radius * 0.985,
      60,
      60,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const faceGeometry = new THREE.SphereGeometry(
      radius * 0.998,
      18,
      12,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const domeFrame = createDomeFrame(radius, 11, 8);
    const domeVisual = registerDomeMaterial(
      createFaceMaterial(0x69b8ff),
      sharedGlassMaterial(),
      domeFrame.lineMaterial,
      domeFrame.nodeMaterial,
      0.6,
      0.6,
      colorPhase
    );

    const shell = new THREE.Mesh(shellGeometry, domeVisual.shellMaterial);
    shell.rotation.x = Math.PI;
    group.add(shell);

    const face = new THREE.Mesh(faceGeometry, domeVisual.faceMaterial);
    face.rotation.x = Math.PI;
    face.renderOrder = 2;
    group.add(face);
    group.add(domeFrame.frameGroup);

    const tower = createGridObject(
      new THREE.CylinderGeometry(radius * 0.22, radius * 0.28, radius * 0.8, 14, 4),
      {
        faceColor: 0x81b8ff,
        lineColor: 0xb1dcff,
        nodeColor: 0xe8f7ff,
        faceOpacity: 0.12,
        nodeSize: 0.13,
        baseHue: 0.57,
        luminance: 0.66,
        phase: colorPhase + 0.12,
      }
    );
    tower.position.y = radius * 0.3;
    group.add(tower);

    const innerOrb = createGridObject(
      new THREE.SphereGeometry(radius * 0.18, 14, 12),
      {
        faceColor: 0xa7ebff,
        lineColor: 0xc7f7ff,
        nodeColor: 0xf4ffff,
        faceOpacity: 0.16,
        nodeSize: 0.11,
        baseHue: 0.5,
        luminance: 0.72,
        phase: colorPhase + 0.2,
      }
    );
    innerOrb.position.set(radius * 0.15, radius * 0.4, 0);
    group.add(innerOrb);

    const basePlate = createGridObject(
      new THREE.CircleGeometry(radius * 0.85, 20),
      {
        faceColor: 0x5875a8,
        lineColor: 0x92bdff,
        nodeColor: 0xc7dcff,
        faceOpacity: 0.08,
        nodeSize: 0.1,
        baseHue: 0.62,
        luminance: 0.56,
        phase: colorPhase + 0.25,
      }
    );
    basePlate.rotation.x = -Math.PI / 2;
    basePlate.position.y = -radius * 0.02;
    group.add(basePlate);

    return group;
  };

  const centralCore = createCore(3.4, 0.0);
  scene.add(centralCore);

  const satelliteConfigs = [
    { angle: Math.PI / 6, radius: 5.4, height: 0.6, phase: 0.2 },
    { angle: Math.PI * 0.9, radius: 6.3, height: 0.4, phase: 0.35 },
    { angle: Math.PI * 1.75, radius: 7.5, height: 0.85, phase: 0.5 },
    { angle: Math.PI * 2.45, radius: 6.8 * goldenRatio, height: 0.3, phase: 0.68 },
  ];

  satelliteConfigs.forEach((config, index) => {
    const group = createSatellite(2.1 * (index === 0 ? 1.05 : 1), config.phase);
    const polarRadius = config.radius * Math.pow(goldenRatio, index * 0.08);
    const x = Math.cos(config.angle) * polarRadius;
    const z = Math.sin(config.angle) * polarRadius;
    group.position.set(x, config.height, z);
    group.rotation.y = -config.angle * 0.6;
    group.rotation.z = (index % 2 === 0 ? 1 : -1) * 0.08;
    domeGroups.push({
      group,
      baseY: config.height,
      phase: config.phase + index * 0.17,
      drift: 0.18 + index * 0.02,
    });
    scene.add(group);

    const curvePoints = [
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(x * 0.42, 1.8 + index * 0.2, z * 0.42),
      new THREE.Vector3(x, config.height + 0.2, z),
    ];
    const conduitCurve = new THREE.CatmullRomCurve3(curvePoints);
    const tube = createGridObject(
      new THREE.TubeGeometry(conduitCurve, 32, 0.12, 8, false),
      {
        faceColor: 0x5c94ff,
        lineColor: 0x8bc1ff,
        nodeColor: 0xcbe6ff,
        faceOpacity: 0.1,
        nodeSize: 0.08,
        baseHue: 0.6,
        luminance: 0.6,
        phase: config.phase + index * 0.11,
      }
    );
    scene.add(tube);
    connectionMeshes.push(tube);
  });

  const createCloud = (centralPosition, scaleMultiplier, depthOffset) => {
    const cloudGroup = new THREE.Group();
    const puffCount = 3;
    for (let i = 0; i < puffCount; i += 1) {
      const puff = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: cloudTexture || null,
          color: new THREE.Color(0xd8e7ff),
          transparent: true,
          opacity: 0.28,
          depthWrite: false,
          blending: THREE.NormalBlending,
        })
      );
      puff.position.set(
        centralPosition.x + (Math.random() - 0.5) * 1.35 * scaleMultiplier,
        centralPosition.y + (Math.random() - 0.5) * 0.45 * scaleMultiplier,
        centralPosition.z + depthOffset + (Math.random() - 0.5) * scaleMultiplier * 0.35
      );
      const puffScale = scaleMultiplier * (1.65 - i * 0.18);
      puff.scale.set(puffScale * 1.35, puffScale, 1);
      cloudGroup.add(puff);
      cloudMaterials.push(puff.material);
    }
    scene.add(cloudGroup);
    cloudGroups.push(cloudGroup);
  };

  createCloud(new THREE.Vector3(0.5, 7.2, -2.8), 2.6, 0.8);
  createCloud(new THREE.Vector3(4.6, 5.9, 2.8), 2.2, -1.0);
  createCloud(new THREE.Vector3(-4.8, 6.0, 3.4), 2.0, 0.5);

  const cameraStops = [
    {
      id: "intro-orbit",
      position: new THREE.Vector3(0, 8.5, 18),
      lookAt: new THREE.Vector3(0, 2.4, 0),
    },
    {
      id: "dome-core",
      position: new THREE.Vector3(0.4, 6.4, 11),
      lookAt: new THREE.Vector3(0, 2.5, 0),
    },
    {
      id: "dome-web",
      position: new THREE.Vector3(6.3, 4, 8),
      lookAt: new THREE.Vector3(3.2, 2, 3.1),
    },
    {
      id: "dome-mobile",
      position: new THREE.Vector3(-6.8, 3.6, 9.5),
      lookAt: new THREE.Vector3(-4, 2, 1.2),
    },
    {
      id: "dome-chain",
      position: new THREE.Vector3(-1, 5.5, -10),
      lookAt: new THREE.Vector3(-3.8, 2.2, -4.5),
    },
    {
      id: "dome-games",
      position: new THREE.Vector3(4.5, 4.2, -11),
      lookAt: new THREE.Vector3(2.2, 2.1, -4.1),
    },
    {
      id: "contact",
      position: new THREE.Vector3(0.4, 6.4, 11),
      lookAt: new THREE.Vector3(0, 2.5, 0),
    },
  ];
  const panelEntries = cameraStops
    .map((stop) => {
      const section = document.getElementById(stop.id);
      const panel = section?.querySelector(".panel");
      if (!section || !panel) return null;
      panel.style.willChange = "transform, opacity, filter";
      return {
        id: stop.id,
        section,
        panel,
        targetY: 0,
        currentY: 0,
        targetOpacity: 0.22,
        currentOpacity: 0.22,
        targetScale: 0.96,
        currentScale: 0.96,
        targetBlur: 8,
        currentBlur: 8,
      };
    })
    .filter(Boolean);

  let desiredCameraPosition = cameraStops[0].position.clone();
  let desiredLookAt = cameraStops[0].lookAt.clone();
  const lookAtVector = desiredLookAt.clone();

  const setPanelState = (entry, y, opacity, scale, blur) => {
    entry.targetY = y;
    entry.targetOpacity = opacity;
    entry.targetScale = scale;
    entry.targetBlur = blur;
  };

  const updateCameraTargetForScroll = () => {
    const viewportMid = window.scrollY + window.innerHeight / 2;
    stopMetrics.length = 0;
    cameraStops.forEach((stop) => {
      const el = document.getElementById(stop.id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const elementMid = rect.top + window.scrollY + rect.height / 2;
      stopMetrics.push({ stop, elementMid });
    });
    if (stopMetrics.length === 0) return;
    if (stopMetrics.length === 1) {
      desiredCameraPosition.copy(stopMetrics[0].stop.position);
      desiredLookAt.copy(stopMetrics[0].stop.lookAt);
      panelEntries.forEach((entry) => {
        setPanelState(entry, 0, entry.id === stopMetrics[0].stop.id ? 1 : 0.18, entry.id === stopMetrics[0].stop.id ? 1 : 0.96, entry.id === stopMetrics[0].stop.id ? 0 : 8);
      });
      return;
    }

    let segmentIndex = 0;
    for (let i = 0; i < stopMetrics.length - 1; i += 1) {
      if (viewportMid >= stopMetrics[i].elementMid) {
        segmentIndex = i;
      }
      if (
        viewportMid >= stopMetrics[i].elementMid &&
        viewportMid <= stopMetrics[i + 1].elementMid
      ) {
        segmentIndex = i;
        break;
      }
    }

    const currentMetric = stopMetrics[segmentIndex];
    const nextMetric = stopMetrics[Math.min(segmentIndex + 1, stopMetrics.length - 1)];
    const segmentSpan = Math.max(1, nextMetric.elementMid - currentMetric.elementMid);
    const rawSegmentProgress = THREE.MathUtils.clamp(
      (viewportMid - currentMetric.elementMid) / segmentSpan,
      0,
      1
    );

    const threshold = 0.38;
    const localParallax = THREE.MathUtils.clamp(
      (rawSegmentProgress / Math.max(threshold, 0.001)) * 2 - 1,
      -1,
      1
    );

    panelEntries.forEach((entry) => {
      setPanelState(entry, 56, 0.16, 0.94, 10);
    });

    if (rawSegmentProgress <= threshold || currentMetric === nextMetric) {
      tempVectorA.copy(currentMetric.stop.position);
      tempVectorB.set(localParallax * 0.9, -Math.abs(localParallax) * 0.22, -Math.abs(localParallax) * 0.8);
      desiredCameraPosition.copy(tempVectorA.add(tempVectorB));

      tempVectorA.copy(currentMetric.stop.lookAt);
      tempVectorB.set(localParallax * 0.45, localParallax * 0.1, localParallax * 0.18);
      desiredLookAt.copy(tempVectorA.add(tempVectorB));

      panelEntries.forEach((entry) => {
        if (entry.id === currentMetric.stop.id) {
          setPanelState(entry, localParallax * 18, 1, 1, 0);
        }
      });
      return;
    }

    const transitionProgress = THREE.MathUtils.smoothstep(
      rawSegmentProgress,
      threshold,
      1
    );
    desiredCameraPosition.copy(currentMetric.stop.position).lerp(
      nextMetric.stop.position,
      transitionProgress
    );
    desiredLookAt.copy(currentMetric.stop.lookAt).lerp(
      nextMetric.stop.lookAt,
      transitionProgress
    );

    const transitionParallax = (rawSegmentProgress - threshold) / (1 - threshold) - 0.5;
    tempVectorC.set(transitionParallax * 0.5, -Math.abs(transitionParallax) * 0.08, 0);
    desiredCameraPosition.add(tempVectorC);

    panelEntries.forEach((entry) => {
      if (entry.id === currentMetric.stop.id) {
        setPanelState(
          entry,
          THREE.MathUtils.lerp(localParallax * 18, -42, transitionProgress),
          THREE.MathUtils.lerp(1, 0.18, transitionProgress),
          THREE.MathUtils.lerp(1, 0.95, transitionProgress),
          THREE.MathUtils.lerp(0, 8, transitionProgress)
        );
      } else if (entry.id === nextMetric.stop.id) {
        setPanelState(
          entry,
          THREE.MathUtils.lerp(52, 0, transitionProgress),
          THREE.MathUtils.lerp(0.18, 1, transitionProgress),
          THREE.MathUtils.lerp(0.95, 1, transitionProgress),
          THREE.MathUtils.lerp(8, 0, transitionProgress)
        );
      }
    });
  };

  const isDarkTheme = () =>
    document.body.classList.contains("theme-dark") ||
    (!document.body.classList.contains("theme-light") &&
      getStoredValue(THEME_STORAGE_KEY) !== "light");

  const applyThemeToScene = (theme) => {
    const isDark = theme === "dark";
    const backgroundColor = new THREE.Color(isDark ? 0x030712 : 0xe8f1ff);
    scene.background = backgroundColor;
    scene.fog = new THREE.Fog(backgroundColor, 18, 48);

    ambientLight.intensity = isDark ? 0.65 : 0.85;
    ambientLight.color = new THREE.Color(isDark ? 0x94aaff : 0xcfe2ff);
    keyLight.intensity = isDark ? 1.25 : 0.95;
    keyLight.color = new THREE.Color(isDark ? 0xcdd6ff : 0xe4e9ff);
    fillLight.intensity = isDark ? 0.45 : 0.3;

    cloudMaterials.forEach((material) => {
      material.color.lerp(
        new THREE.Color(isDark ? 0xc7d7f1 : 0xf1f4fb),
        0.6
      );
      material.opacity = isDark ? 0.34 : 0.42;
    });

    domeMaterials.forEach((entry) => {
      entry.shellMaterial.opacity = isDark ? 0.22 : 0.16;
      entry.shellMaterial.color.set(isDark ? 0x8abaff : 0x72a0f2);
      entry.faceMaterial.opacity = isDark ? 0.12 : 0.08;
      entry.lineMaterial.opacity = isDark ? 0.92 : 0.72;
      entry.nodeMaterial.opacity = isDark ? 0.95 : 0.8;
    });

    accentGridMaterials.forEach((entry) => {
      entry.faceMaterial.opacity = isDark ? 0.12 : 0.07;
      entry.lineMaterial.opacity = isDark ? 0.84 : 0.64;
      entry.nodeMaterial.opacity = isDark ? 0.9 : 0.72;
    });
  };

  const clock = new THREE.Clock();
  const tempColor = new THREE.Color();
  let animationFrameId = null;
  let shouldAnimate = false;

  const showCanvas = () => {
    if (!sceneLayerEl) return;
    sceneLayerEl.classList.add("scene-layer--ready");
    canvas.classList.remove("scene-layer__canvas--hidden");
  };

  const animateFrame = () => {
    if (!shouldAnimate) return;

    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();

    camera.position.lerp(desiredCameraPosition, 0.06);
    lookAtVector.lerp(desiredLookAt, 0.07);
    camera.lookAt(lookAtVector);

    cloudGroups.forEach((group, idx) => {
      const direction = idx % 2 === 0 ? 1 : -1;
      group.position.x += direction * delta * 0.12;
      group.position.z += Math.sin(elapsed * 0.08 + idx) * delta * 0.05;
      if (group.position.x > 12) group.position.x = -12;
      if (group.position.x < -12) group.position.x = 12;
    });

    domeMaterials.forEach((entry) => {
      const hue =
        (entry.baseHue + entry.phase + elapsed * rainbowColorSpeed * 0.1) % 1;
      tempColor.setHSL(hue, 0.52, entry.luminance);

      const accentHue = (hue + 0.08) % 1;
      const accentLuminance = Math.min(0.84, entry.luminance + 0.16);
      const accentColor = new THREE.Color().setHSL(accentHue, 0.78, accentLuminance);

      entry.shellMaterial.color.lerp(tempColor, 0.08);
      entry.shellMaterial.opacity = 0.22;
      entry.faceMaterial.color.lerp(tempColor, 0.16);
      entry.lineMaterial.color.lerp(accentColor, 0.18);
      entry.nodeMaterial.color.lerp(accentColor, 0.2);
    });

    accentGridMaterials.forEach((entry) => {
      const hue =
        (entry.baseHue + entry.phase + elapsed * rainbowColorSpeed * 0.08) % 1;
      tempColor.setHSL(hue, 0.48, entry.luminance);

      const accentHue = (hue + 0.06) % 1;
      const accentLuminance = Math.min(0.82, entry.luminance + 0.14);
      const accentColor = new THREE.Color().setHSL(accentHue, 0.68, accentLuminance);

      entry.faceMaterial.color.lerp(tempColor, 0.15);
      entry.lineMaterial.color.lerp(accentColor, 0.16);
      entry.nodeMaterial.color.lerp(accentColor, 0.18);
    });

    domeGroups.forEach((entry, idx) => {
      const bob = Math.sin(elapsed * entry.drift + entry.phase * Math.PI * 2) * 0.08;
      entry.group.position.y = entry.baseY + bob;
      entry.group.rotation.y += delta * (0.05 + idx * 0.002);
    });

    panelEntries.forEach((entry) => {
      entry.currentY = THREE.MathUtils.lerp(entry.currentY, entry.targetY, 0.12);
      entry.currentOpacity = THREE.MathUtils.lerp(
        entry.currentOpacity,
        entry.targetOpacity,
        0.12
      );
      entry.currentScale = THREE.MathUtils.lerp(entry.currentScale, entry.targetScale, 0.12);
      entry.currentBlur = THREE.MathUtils.lerp(entry.currentBlur, entry.targetBlur, 0.12);
      entry.panel.style.opacity = `${entry.currentOpacity}`;
      entry.panel.style.transform = `translate3d(0, ${entry.currentY}px, 0) scale(${entry.currentScale})`;
      entry.panel.style.filter = `blur(${entry.currentBlur}px)`;
    });

    renderer.render(scene, camera);
    if (shouldAnimate) {
      animationFrameId = requestAnimationFrame(animateFrame);
    }
  };

  const startAnimation = () => {
    if (shouldAnimate) return;
    shouldAnimate = true;
    clock.getDelta();
    animationFrameId = requestAnimationFrame(animateFrame);
  };

  const stopAnimation = () => {
    shouldAnimate = false;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  window.addEventListener("aniloom:theme-change", (event) => {
    applyThemeToScene(event.detail.theme);
  });

  applyThemeToScene(isDarkTheme() ? "dark" : "light");
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  cloudGroups.forEach((group) => {
    group.visible = true;
  });
  domeMaterials.forEach((entry) => {
    entry.shellMaterial.transmission = 0.72;
    entry.shellMaterial.roughness = 0.08;
    entry.faceMaterial.opacity = 0.12;
    entry.nodeMaterial.size = 0.19;
  });
  showCanvas();
  startAnimation();

  updateCameraTargetForScroll();
  window.addEventListener("scroll", () => {
    requestAnimationFrame(updateCameraTargetForScroll);
  });

  window.addEventListener("resize", () => {
    const { innerWidth, innerHeight } = window;
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
};

document.addEventListener("DOMContentLoaded", initScene);
