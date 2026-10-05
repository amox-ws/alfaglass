"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial, RoundedBox, Text } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const FROST = "#f2f8f9"; // --surface (frost)
const TEXT_Z = -2.5;
const INDIGO = "#262354"; // --fg (softened brand indigo)

type Props = {
  lines: string[][]; // [landscape lines, portrait lines]
  onReady: () => void;
  active: boolean;
};

export default function GlassScene({ lines, onReady, active }: Props) {
  const [small] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, small ? 1.5 : 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 12], fov: 30 }}
      aria-hidden
    >
      <color attach="background" args={[FROST]} />
      <Suspense fallback={null}>
        <Rig>
          <Glow />
          <Headline lines={lines} onReady={onReady} />
          <Panes small={small} />
        </Rig>
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={5} color="#ffffff" position={[0, 5, -3]} scale={[12, 0.6, 1]} />
          <Lightformer form="rect" intensity={4} color="#a8ecff" position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[10, 0.25, 1]} />
          <Lightformer form="rect" intensity={3} color="#ffffff" position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[10, 0.25, 1]} />
          <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[0, 0, 10]} scale={[16, 10, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}

/**
 * Soft light behind the type: gives the panes something luminous to bend,
 * like daylight caught through a stack of float glass.
 */
function Glow() {
  const { camera, size } = useThree();
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    g.addColorStop(0, "rgba(102, 207, 225, 0.5)");
    g.addColorStop(0.35, "rgba(128, 175, 235, 0.26)");
    g.addColorStop(0.7, "rgba(166, 222, 210, 0.12)");
    g.addColorStop(1, "rgba(242, 248, 249, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const cam = camera as THREE.PerspectiveCamera;
  const z = -6;
  const h = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * (cam.position.z - z);
  const w = h * (size.width / size.height);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    m.position.x = Math.sin(t * 0.18) * w * 0.12 + state.pointer.x * w * 0.08;
    m.position.y = Math.cos(t * 0.14) * h * 0.06 + state.pointer.y * h * 0.05;
  });
  return (
    <mesh ref={ref} position={[0, 0, z]}>
      <planeGeometry args={[Math.max(w, h) * 1.1, Math.max(w, h) * 1.1]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/** Pointer + scroll driven camera drift. */
function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const scroll = Math.min(1, window.scrollY / window.innerHeight);
    const px = state.pointer.x;
    const py = state.pointer.y;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, px * 0.08, 3, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -py * 0.05 + scroll * 0.12, 3, delta);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, 12 + scroll * 3, 4, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, -scroll * 1.2, 4, delta);
  });
  return <group ref={group}>{children}</group>;
}

function Headline({ lines, onReady }: { lines: string[][]; onReady: () => void }) {
  const { camera, size } = useThree();
  const portrait = size.width / size.height < 0.95;
  const text = (portrait ? lines[1] : lines[0]).join("\n");
  const ref = useRef<THREE.Mesh & { geometry: THREE.BufferGeometry }>(null);
  const [scale, setScale] = useState(0);

  const view = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const dist = cam.position.z - TEXT_Z;
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * dist;
    return { w: h * (size.width / size.height), h };
  }, [camera, size.width, size.height]);

  const fit = () => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.geometry.computeBoundingBox();
    const bb = mesh.geometry.boundingBox;
    if (!bb) return;
    const w = bb.max.x - bb.min.x;
    const h = bb.max.y - bb.min.y;
    if (!w || !h) return;
    const s = Math.min((view.w * (portrait ? 0.88 : 0.9)) / w, (view.h * (portrait ? 0.46 : 0.46)) / h);
    setScale(s);
    onReady();
  };

  useEffect(fit, [view.w, view.h, portrait]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Text
      ref={ref}
      font="/fonts/sofia-xc-800.ttf"
      fontSize={1}
      lineHeight={0.8}
      letterSpacing={-0.01}
      textAlign="center"
      anchorX="center"
      anchorY="middle"
      position={[0, view.h * (portrait ? 0.1 : 0.09), TEXT_Z]}
      scale={scale || 0.0001}
      color={INDIGO}
      material-toneMapped={false}
      onSync={fit}
    >
      {text}
    </Text>
  );
}

const PANE_LAYOUT = [
  { x: -0.34, rot: 0.62, h: 1.0, phase: 0.0 },
  { x: -0.12, rot: -0.38, h: 1.12, phase: 1.3 },
  { x: 0.1, rot: 0.48, h: 0.94, phase: 2.1 },
  { x: 0.32, rot: -0.56, h: 1.06, phase: 3.4 },
];

function Panes({ small }: { small: boolean }) {
  const { size, camera } = useThree();
  const portrait = size.width / size.height < 0.95;
  const layout = portrait ? PANE_LAYOUT.filter((_, i) => i === 1 || i === 2) : PANE_LAYOUT;

  const view = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.position.z;
    return { w: h * (size.width / size.height), h };
  }, [camera, size.width, size.height]);

  const paneW = portrait ? view.w * 0.34 : Math.min(view.w * 0.13, 2.3);
  const paneH = view.h * (portrait ? 0.44 : 0.54);

  return (
    <>
      {layout.map((p, i) => (
        <Pane
          key={i}
          index={i}
          x={p.x * view.w * (portrait ? 1.5 : 1)}
          baseRot={p.rot}
          width={paneW}
          height={paneH * p.h}
          phase={p.phase}
          samples={small ? 4 : 8}
        />
      ))}
    </>
  );
}

function Pane({
  x,
  baseRot,
  width,
  height,
  phase,
  samples,
}: {
  index: number;
  x: number;
  baseRot: number;
  width: number;
  height: number;
  phase: number;
  samples: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime;
    const scroll = Math.min(1, window.scrollY / window.innerHeight);
    // As the page scrolls the fanned panes close into a single wall of glass.
    const target = baseRot * (1 - scroll * 0.85) + Math.sin(t * 0.35 + phase) * 0.06 + state.pointer.x * 0.25;
    m.rotation.y = THREE.MathUtils.damp(m.rotation.y, target, 2.5, delta);
    m.position.y = height * 0.12 + Math.sin(t * 0.5 + phase) * 0.08;
  });

  return (
    <RoundedBox ref={ref} args={[width, height, 0.14]} radius={0.035} smoothness={4} position={[x, height * 0.12, 0.6]}>
      <MeshTransmissionMaterial
        samples={samples}
        resolution={768}
        transmission={1}
        thickness={0.55}
        roughness={0.02}
        ior={1.52}
        chromaticAberration={0.09}
        anisotropicBlur={0.08}
        distortion={0.12}
        distortionScale={0.4}
        temporalDistortion={0.04}
        backside
        backsideThickness={0.3}
        color="#f6fffc"
        attenuationColor="#7fd3c0"
        attenuationDistance={1.9}
      />
    </RoundedBox>
  );
}
