"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial, PerformanceMonitor, RoundedBox, Text, useFBO } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const FROST = "#f8fafd"; // --surface (frost)
const TEXT_Z = -2.5;
const INDIGO = "#262354"; // --fg (softened brand indigo)

type Props = {
  lines: string[][]; // [landscape lines, portrait lines]
  onReady: () => void;
  /** Called if this device cannot hold the frame rate; the hero then swaps to its CSS panes. */
  onSlow: () => void;
  active: boolean;
};

export default function GlassScene({ lines, onReady, onSlow, active }: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      // 1x pixels: the type is SDF and stays crisp, and it keeps 60 fps even on a 2560×1440 retina screen
      dpr={1}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 12], fov: 30 }}
      aria-hidden
    >
      {/* Gives up if most of a 2.5 s window runs under 50 fps (80 on 120 Hz screens): drei's default of 40 already looks choppy */}
      <PerformanceMonitor bounds={(refreshrate) => (refreshrate > 100 ? [80, 100] : [50, 60])} onDecline={onSlow} />
      <color attach="background" args={[FROST]} />
      <Suspense fallback={null}>
        <Rig>
          <Glow />
          <Headline lines={lines} onReady={onReady} />
          <Panes />
        </Rig>
        {/*
          A bright studio for the panes to reflect. The strips are tall, like the panes: a horizontal strip showed up as a
          faint band across a pane, a tall one lights its edge.
        */}
        <Environment resolution={256} frames={1}>
          <mesh scale={60}>
            <sphereGeometry args={[1, 32, 16]} />
            <meshBasicMaterial color="#e9eef6" side={THREE.BackSide} />
          </mesh>
          <Lightformer form="rect" intensity={6} color="#ffffff" position={[0, 5, -3]} scale={[12, 0.4, 1]} />
          <Lightformer form="rect" intensity={3} color="#ffffff" position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[0.6, 12, 1]} />
          <Lightformer form="rect" intensity={3} color="#ffffff" position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[0.6, 12, 1]} />
          <Lightformer form="rect" intensity={1} color="#262354" position={[0, -5, 3]} rotation-x={-Math.PI / 2} scale={[14, 0.5, 1]} />
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
    g.addColorStop(0, "rgba(150, 188, 240, 0.34)");
    g.addColorStop(0.35, "rgba(178, 196, 242, 0.18)");
    g.addColorStop(0.7, "rgba(214, 222, 246, 0.08)");
    g.addColorStop(1, "rgba(248, 250, 253, 0)");
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

function Panes() {
  const { size, camera } = useThree();
  const portrait = size.width / size.height < 0.95;
  const layout = portrait ? PANE_LAYOUT.filter((_, i) => i === 1 || i === 2) : PANE_LAYOUT;
  const group = useRef<THREE.Group>(null);

  // One refraction buffer for every pane: the scene without the panes, rendered once per frame
  // at half the canvas size (what is seen through thick glass is soft anyway).
  // Each pane rendering its own 1024² buffer used to cost four extra renders a frame.
  const buffer = useFBO(Math.max(1, Math.round(size.width * 0.5)), Math.max(1, Math.round(size.height * 0.5)));
  const falloff = useEdgeFalloff();
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const tone = state.gl.toneMapping;
    state.gl.toneMapping = THREE.NoToneMapping; // the main render tone-maps once
    g.visible = false;
    state.gl.setRenderTarget(buffer);
    state.gl.render(state.scene, state.camera);
    state.gl.setRenderTarget(null);
    g.visible = true;
    state.gl.toneMapping = tone;
  });

  const view = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.position.z;
    return { w: h * (size.width / size.height), h };
  }, [camera, size.width, size.height]);

  const paneW = portrait ? view.w * 0.34 : Math.min(view.w * 0.13, 2.3);
  const paneH = view.h * (portrait ? 0.44 : 0.54);

  return (
    <group ref={group}>
      {layout.map((p, i) => (
        <Pane
          key={i}
          x={p.x * view.w * (portrait ? 1.5 : 1)}
          baseRot={p.rot}
          width={paneW}
          height={paneH * p.h}
          phase={p.phase}
          buffer={buffer.texture}
          falloff={falloff}
        />
      ))}
    </group>
  );
}

function Pane({
  x,
  baseRot,
  width,
  height,
  phase,
  buffer,
  falloff,
}: {
  x: number;
  baseRot: number;
  width: number;
  height: number;
  phase: number;
  buffer: THREE.Texture;
  falloff: THREE.Texture;
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

  const rim = useMemo(() => {
    // The front face's outline, a hair in front of it: 1px of bright glass edge (WebGL draws every line 1px wide)
    const hw = width / 2 - 0.02;
    const hh = height / 2 - 0.02;
    const z = PANE_DEPTH / 2 + 0.002;
    return new Float32Array([-hw, -hh, z, hw, -hh, z, hw, hh, z, -hw, hh, z]);
  }, [width, height]);

  return (
    <RoundedBox ref={ref} args={[width, height, PANE_DEPTH]} radius={0.035} smoothness={4} position={[x, height * 0.12, 0.6]}>
      {/*
        Ultra-clear glass: the transmitted light is not tone-mapped (the ACES curve turned the pale page behind the pane
        into a grey slab), the refraction is thin enough to bend the headline instead of doubling it, and the colour
        fringe is a hair, not a ghost.
      */}
      <MeshTransmissionMaterial
        buffer={buffer}
        resolution={16} // the material's own buffers go unused with a shared one: keep them tiny
        samples={4}
        transmission={1}
        thickness={0.14}
        roughness={0}
        ior={1.45}
        chromaticAberration={0.012}
        anisotropicBlur={0}
        distortion={0}
        distortionScale={0}
        temporalDistortion={0}
        envMapIntensity={0.7}
        color="#ffffff"
        attenuationColor="#e8eefa"
        attenuationDistance={3}
        toneMapped={false}
      />
      {/* A little cool shade toward the rim, the way thick glass darkens at its edge, and two streaks of studio light */}
      <mesh position={[0, 0, PANE_DEPTH / 2 + 0.001]} renderOrder={2}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={falloff} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <lineLoop renderOrder={3}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[rim, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.95} toneMapped={false} />
      </lineLoop>
    </RoundedBox>
  );
}

const PANE_DEPTH = 0.14;

/** Clear in the middle, a faint blue-grey toward the rims, and two soft streaks of light across the face. */
function useEdgeFalloff() {
  return useMemo(() => {
    const w = 128;
    const h = 512;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    const sides = ctx.createLinearGradient(0, 0, w, 0);
    sides.addColorStop(0, "rgba(146, 168, 204, 0.42)");
    sides.addColorStop(0.08, "rgba(146, 168, 204, 0.16)");
    sides.addColorStop(0.5, "rgba(146, 168, 204, 0)");
    sides.addColorStop(0.92, "rgba(146, 168, 204, 0.16)");
    sides.addColorStop(1, "rgba(146, 168, 204, 0.42)");
    ctx.fillStyle = sides;
    ctx.fillRect(0, 0, w, h);
    const ends = ctx.createLinearGradient(0, 0, 0, h);
    ends.addColorStop(0, "rgba(146, 168, 204, 0.3)");
    ends.addColorStop(0.05, "rgba(146, 168, 204, 0)");
    ends.addColorStop(0.95, "rgba(146, 168, 204, 0)");
    ends.addColorStop(1, "rgba(146, 168, 204, 0.3)");
    ctx.fillStyle = ends;
    ctx.fillRect(0, 0, w, h);
    const streak = ctx.createLinearGradient(0, 0, w * 1.6, h * 0.7);
    streak.addColorStop(0.2, "rgba(255, 255, 255, 0)");
    streak.addColorStop(0.3, "rgba(255, 255, 255, 0.3)");
    streak.addColorStop(0.38, "rgba(255, 255, 255, 0)");
    streak.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    streak.addColorStop(0.55, "rgba(255, 255, 255, 0.14)");
    streak.addColorStop(0.6, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = streak;
    ctx.fillRect(0, 0, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}
