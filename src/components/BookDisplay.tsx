import { Canvas, useLoader } from "@react-three/fiber";
import { BufferGeometry, TextureLoader } from "three";
import {
  AccumulativeShadows,
  Environment,
  RandomizedLight,
  useGLTF,
} from "@react-three/drei";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";
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
  const coverAspect = coverMap.image.width / coverMap.image.height;
  const spineAspect = spineMap.image.width / spineMap.image.height;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, spineAspect / 2]}>
        <planeGeometry args={[coverAspect, 1]} />
        <meshStandardMaterial map={coverMap} side={2} shadowSide={2} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        rotation={[0, -Math.PI / 2.0, 0]}
        position={[-coverAspect / 2, 0, 0]}
      >
        <planeGeometry args={[spineAspect, 1]} />
        <meshStandardMaterial map={spineMap} side={2} shadowSide={2} />
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
        <meshStandardMaterial side={2} shadowSide={2} color={backColor} />
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
  const coverAspect = coverMap.image.width / coverMap.image.height;
  const spineAspect = spineMap.image.width / spineMap.image.height;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0, spineAspect / 2]}>
        <planeGeometry args={[coverAspect, 1]} />
        <meshStandardMaterial map={coverMap} side={2} shadowSide={2} />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        rotation={[0, -Math.PI / 2.0, 0]}
        position={[-coverAspect / 2, 0, 0]}
      >
        <planeGeometry args={[spineAspect, 1]} />
        <meshStandardMaterial map={spineMap} side={2} shadowSide={2} />
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
}: {
  coverUrl: string;
  spineUrl: string;
  backColor: string;
  bookType: BookType;
}) {
  const coverMap = useLoader(TextureLoader, coverUrl);
  const spineMap = useLoader(TextureLoader, spineUrl);

  return (
    <div className="w-[500px] h-[600px]">
      <Canvas
        shadows
        orthographic
        camera={{ position: [-4, 1.5, 10], zoom: 430, near: 1, far: 20 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        dpr={[2, 4]}
      >
        <Environment files={["environment.hdr"]} environmentIntensity={0.93} />
        <EffectComposer enableNormalPass multisampling={32}>
          <N8AO
            color="black"
            aoRadius={0.05}
            intensity={3}
            aoSamples={300}
            denoiseSamples={16}
          />
          <SMAA />
        </EffectComposer>
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
          <RandomizedLight radius={30} position={[5, 20, 5]} bias={0.00001} />
        </AccumulativeShadows>
      </Canvas>
    </div>
  );
}
