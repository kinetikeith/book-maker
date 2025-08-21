import { Canvas, useLoader } from "@react-three/fiber";
import { BufferGeometry, TextureLoader } from "three";
import {
  AccumulativeShadows,
  RandomizedLight,
  useGLTF,
} from "@react-three/drei";
import {
  EffectComposer,
  N8AO,
  FXAA,
  BrightnessContrast,
} from "@react-three/postprocessing";
import { Texture } from "three";

export enum BookType {
  PerfectBound,
  Hardcover,
  Saddlestitch,
}

function HardcoverBook({
  coverMap,
  spineMap,
  backColor,
}: {
  coverMap: Texture;
  spineMap: Texture;
  backColor: string;
}) {
  const pageMap = useLoader(TextureLoader, "page-effect.png");
  const coverNormalMap = useLoader(TextureLoader, "hardcover-cover-normal.png");
  const spineNormalMap = useLoader(TextureLoader, "hardcover-spine-normal.png");
  const coverAspect = coverMap.image.width / coverMap.image.height;
  const spineAspect = spineMap.image.width / spineMap.image.height;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, spineAspect / 2]}>
        <planeGeometry args={[coverAspect, 1]} />
        <meshStandardMaterial
          map={coverMap}
          normalMap={coverNormalMap}
          side={2}
          shadowSide={2}
          roughness={0.1}
          normalScale={0.5}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        rotation={[0, -Math.PI / 2.0, 0]}
        position={[-coverAspect / 2, 0, 0]}
      >
        <planeGeometry args={[spineAspect, 1]} />
        <meshStandardMaterial
          map={spineMap}
          normalMap={spineNormalMap}
          side={2}
          shadowSide={2}
          roughness={0.1}
          normalScale={0.5}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2.0, 0, 0]}
        position={[0, 0.49, 0]}
      >
        <planeGeometry args={[coverAspect, spineAspect]} />
        <meshStandardMaterial map={pageMap} side={2} shadowSide={2} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, -spineAspect / 2]}>
        <planeGeometry args={[coverAspect, 1]} />
        <meshStandardMaterial
          normalMap={coverNormalMap}
          side={2}
          shadowSide={2}
          color={backColor}
          roughness={0.1}
          normalScale={0.5}
        />
      </mesh>
      <mesh castShadow position={[0, -0.25, 0]}>
        <boxGeometry args={[coverAspect - 0.01, 0.5, spineAspect - 0.01]} />
        <shadowMaterial />
      </mesh>
    </group>
  );
}

function PerfectBoundBook({
  coverMap,
  spineMap,
}: {
  coverMap: Texture;
  spineMap: Texture;
}) {
  const pageMap = useLoader(TextureLoader, "page-effect.png");
  const coverNormalMap = useLoader(
    TextureLoader,
    "perfectbound-cover-normal.png",
  );
  const spineNormalMap = useLoader(
    TextureLoader,
    "perfectbound-spine-normal.png",
  );
  const coverAspect = coverMap.image.width / coverMap.image.height;
  const spineAspect = spineMap.image.width / spineMap.image.height;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, spineAspect / 2]}>
        <planeGeometry args={[coverAspect, 1]} />
        <meshStandardMaterial
          map={coverMap}
          normalMap={coverNormalMap}
          side={2}
          shadowSide={2}
          normalScale={0.7}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        rotation={[0, -Math.PI / 2.0, 0]}
        position={[-coverAspect / 2, 0, 0]}
      >
        <planeGeometry args={[spineAspect, 1]} />
        <meshStandardMaterial
          map={spineMap}
          normalMap={spineNormalMap}
          side={2}
          shadowSide={2}
          normalScale={0.7}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        rotation={[-Math.PI / 2.0, 0, 0]}
        position={[0, 0.5, 0]}
      >
        <planeGeometry args={[coverAspect, spineAspect]} />
        <meshStandardMaterial map={pageMap} side={2} shadowSide={2} />
      </mesh>
      <mesh castShadow position={[0, -0.25, 0]}>
        <boxGeometry args={[coverAspect - 0.01, 0.5, spineAspect - 0.01]} />
        <shadowMaterial />
      </mesh>
    </group>
  );
}

interface GeometryContainer {
  geometry: BufferGeometry;
}

function SaddlestitchBook({ coverMap }: { coverMap: Texture }) {
  const pageMap = useLoader(TextureLoader, "page-effect.png");
  const coverAspect = coverMap.image.width / coverMap.image.height;
  const { nodes } = useGLTF("saddlestitch.glb");
  return (
    <group scale={[coverAspect, 1, 1]} position={[0, -0.002, 0]}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cover as unknown as GeometryContainer).geometry}
      >
        <meshStandardMaterial map={coverMap} side={2} shadowSide={2} />
      </mesh>
      <mesh
        receiveShadow
        geometry={(nodes.Pages as unknown as GeometryContainer).geometry}
      >
        <meshStandardMaterial map={pageMap} side={2} />
      </mesh>
    </group>
  );
}

export default function BookDisplay({
  coverUrl,
  spineUrl,
  backColor,
  bookType,
  scale,
}: {
  coverUrl: string;
  spineUrl: string;
  backColor: string;
  bookType: BookType;
  scale: number;
}) {
  const coverMap = useLoader(TextureLoader, coverUrl);
  const spineMap = useLoader(TextureLoader, spineUrl);

  const coverAspect = coverMap.image.width / coverMap.image.height;
  const spineAspect = spineMap.image.width / spineMap.image.height;

  let itemScalingInv = coverAspect;
  if (bookType !== BookType.Saddlestitch) itemScalingInv += spineAspect * 0.5;

  const imageWidth = 600;
  const zoom = imageWidth * 0.68;
  const imageHeight = Math.min((imageWidth * 0.8) / itemScalingInv, 900);
  const dpr = scale * 2;
  const finalWidth = imageWidth * dpr;
  const finalHeight = imageHeight * dpr;

  return (
    <div
      style={{
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
      }}
      className="relative flex flex-col items-center"
    >
      <Canvas
        shadows
        orthographic
        camera={{ position: [-4, 1.5, 10], zoom: zoom, near: 1, far: 200 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        dpr={[dpr, dpr]}
      >
        <pointLight
          color={0xffffff}
          position={[-9, 25, 10]}
          intensity={7300.0}
          distance={0}
        />
        <EffectComposer enableNormalPass multisampling={32}>
          <BrightnessContrast contrast={0.1} />
          <FXAA />
          <N8AO
            color="black"
            aoRadius={0.05}
            intensity={3}
            aoSamples={300}
            denoiseSamples={16}
          />
        </EffectComposer>
        <group scale={1.0 / itemScalingInv}>
          {bookType === BookType.Hardcover ? (
            <HardcoverBook
              coverMap={coverMap}
              spineMap={spineMap}
              backColor={backColor}
            />
          ) : null}
          {bookType === BookType.PerfectBound ? (
            <PerfectBoundBook coverMap={coverMap} spineMap={spineMap} />
          ) : null}
          {bookType === BookType.Saddlestitch ? (
            <SaddlestitchBook coverMap={coverMap} />
          ) : null}
          <mesh
            castShadow
            rotation={[-Math.PI / 2.0, 0, 0]}
            position={[0, -0.501, 0]}
          >
            <planeGeometry args={[2, 2]} />
            <shadowMaterial transparent opacity={0} />
          </mesh>
          <AccumulativeShadows
            position={[0, -0.5, 0]}
            temporal
            frames={100}
            alphaTest={0.99}
            opacity={1.0}
          >
            <RandomizedLight radius={35} position={[5, 25, 5]} bias={0.001} />
          </AccumulativeShadows>
        </group>
      </Canvas>
      <div className="text-gray-200 text-sm font-medium absolute -bottom-8 text-center px-4 py-2 rounded-md z-10 bg-gray-600">
        <div>
          {imageWidth * dpr} &times; {(imageHeight * dpr).toFixed(0)} pixels
        </div>
        <div>
          {(finalWidth / 300).toFixed(2)}" &times;{" "}
          {(finalHeight / 300).toFixed(2)}" @ 300ppi
        </div>
      </div>
    </div>
  );
}
