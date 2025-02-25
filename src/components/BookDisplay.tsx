import { Canvas, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import {
  AccumulativeShadows,
  Environment,
  RandomizedLight,
} from "@react-three/drei";
import { EffectComposer, N8AO, SMAA } from "@react-three/postprocessing";

export default function BookDisplay({
  coverUrl,
  spineUrl,
  backColor,
}: {
  coverUrl: string;
  spineUrl: string;
  backColor: string;
}) {
  const coverMap = useLoader(TextureLoader, coverUrl);
  const spineMap = useLoader(TextureLoader, spineUrl);
  const pageMap = useLoader(TextureLoader, "page-effect.png");
  const coverAspect = coverMap.image.width / coverMap.image.height;
  const spineAspect = spineMap.image.width / spineMap.image.height;

  return (
    <div className="w-[500px] h-[600px]">
      <Canvas
        shadows
        orthographic
        camera={{ position: [-5, 2, 10], zoom: 400, near: 1, far: 20 }}
        gl={{ antialias: true }}
        dpr={[2, 4]}
      >
        <Environment files={["public/environment.hdr"]} />
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
        <group>
          <mesh castShadow receiveShadow>
            <planeGeometry args={[coverAspect, 1]} />
            <meshStandardMaterial map={coverMap} side={2} shadowSide={2} />
          </mesh>
          <mesh
            castShadow
            receiveShadow
            rotation={[0, -Math.PI / 2.0, 0]}
            position={[-coverAspect / 2, 0, -spineAspect / 2]}
          >
            <planeGeometry args={[spineAspect, 1]} />
            <meshStandardMaterial map={spineMap} side={2} shadowSide={2} />
          </mesh>
          <mesh
            castShadow
            receiveShadow
            rotation={[-Math.PI / 2.0, 0, 0]}
            position={[0, 0.49, -spineAspect / 2]}
          >
            <planeGeometry args={[coverAspect, spineAspect]} />
            <meshStandardMaterial map={pageMap} side={2} shadowSide={2} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 0, -spineAspect]}>
            <planeGeometry args={[coverAspect, 1]} />
            <meshStandardMaterial side={2} shadowSide={2} color={backColor} />
          </mesh>
        </group>
        <mesh
          castShadow
          rotation={[-Math.PI / 2.0, 0, 0]}
          position={[0, -0.501, 0]}
        >
          <planeGeometry args={[coverAspect, spineAspect]} />
          <shadowMaterial transparent opacity={0} />
        </mesh>
        <mesh castShadow position={[0, -0.25, -spineAspect / 2]}>
          <boxGeometry args={[coverAspect - 0.01, 0.5, spineAspect - 0.01]} />
          <shadowMaterial />
        </mesh>
        <AccumulativeShadows
          position={[0, -0.5, 0]}
          temporal
          frames={100}
          alphaTest={0.99}
          opacity={1.0}
        >
          <RandomizedLight radius={30} position={[5, 20, 5]} bias={0.001} />
        </AccumulativeShadows>
      </Canvas>
    </div>
  );
}
