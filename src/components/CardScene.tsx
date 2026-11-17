import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Card, Suit } from "../game/rules";

function faceTexture(card: Card, activeSuit: Suit): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create the card texture");

  context.fillStyle = "#f8f6f2";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#0a0014";
  context.lineWidth = 12;
  context.strokeRect(22, 22, 468, 676);
  context.fillStyle = "#0a0014";
  context.font = "700 96px 'Space Mono', monospace";
  context.fillText(card.rank, 56, 132);
  context.font = "400 30px 'Space Mono', monospace";
  context.fillText(card.suit.toUpperCase(), 58, 174);
  context.textAlign = "center";
  context.font = "700 168px 'Space Mono', monospace";
  context.fillStyle = card.suit === "hearts" || card.suit === "diamonds" ? "#ff006e" : "#0a0014";
  context.fillText(card.rank, 256, 410);
  context.font = "400 28px 'Space Mono', monospace";
  context.fillStyle = "#0a0014";
  context.fillText(`ACTIVE ${activeSuit.toUpperCase()}`, 256, 632);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function backTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create the card back texture");
  context.fillStyle = "#0a0014";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#00ffff";
  context.lineWidth = 12;
  context.strokeRect(28, 28, 456, 664);
  context.lineWidth = 3;
  context.strokeRect(58, 58, 396, 604);
  context.fillStyle = "#ff006e";
  context.font = "700 132px 'Space Mono', monospace";
  context.textAlign = "center";
  context.fillText("B", 256, 408);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function CardScene({ card, activeSuit }: { card: Card; activeSuit: Suit }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer | undefined;
    let observer: ResizeObserver | undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.z = 4.4;
    setError(null);

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      host.replaceChildren(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 1.6));
      const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
      keyLight.position.set(-2, 3, 5);
      scene.add(keyLight);

      const frontTexture = faceTexture(card, activeSuit);
      const rearTexture = backTexture();
      const edge = new THREE.MeshStandardMaterial({ color: "#00ffff", roughness: 0.45 });
      const front = new THREE.MeshStandardMaterial({ map: frontTexture, roughness: 0.82 });
      const back = new THREE.MeshStandardMaterial({ map: rearTexture, roughness: 0.82 });
      const materials = [edge, edge, edge, edge, front, back];
      const geometry = new THREE.BoxGeometry(1.75, 2.45, 0.055);
      const mesh = new THREE.Mesh(geometry, materials);
      const group = new THREE.Group();
      group.add(mesh);
      group.rotation.y = -0.18;
      scene.add(group);

      const resize = () => {
        const { width, height } = host.getBoundingClientRect();
        if (width <= 0 || height <= 0 || !renderer) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      observer = new ResizeObserver(resize);
      observer.observe(host);
      resize();

      let previousTime: number | null = null;
      let elapsed = 0;
      renderer.setAnimationLoop((time) => {
        if (previousTime !== null) elapsed += Math.min((time - previousTime) / 1000, 0.05);
        previousTime = time;
        group.rotation.y = -0.18 + Math.sin(elapsed * 0.55) * 0.16;
        group.rotation.x = Math.cos(elapsed * 0.4) * 0.035;
        renderer?.render(scene, camera);
      });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "WebGL renderer could not be initialized";
      setError(message);
      renderer?.dispose();
    }

    return () => {
      observer?.disconnect();
      renderer?.setAnimationLoop(null);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of objectMaterials) {
          material.map?.dispose();
          material.dispose();
        }
      });
      renderer?.dispose();
      if (renderer?.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, [card.id, card.rank, card.suit, activeSuit]);

  return (
    <div
      className="card-scene"
      ref={hostRef}
      role="img"
      aria-label={`Three-dimensional view of the ${card.rank} of ${card.suit}`}
      data-testid="card-scene"
    >
      {error && <p className="scene-error" role="alert">{error}. The 2D game controls remain available.</p>}
    </div>
  );
}
