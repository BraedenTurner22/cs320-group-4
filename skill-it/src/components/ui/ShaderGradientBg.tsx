'use client'

import dynamic from 'next/dynamic'

const GradientScene = dynamic(
  async () => {
    const { ShaderGradientCanvas, ShaderGradient } = await import('@shadergradient/react')

    function Scene() {
      return (
        <ShaderGradientCanvas
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <ShaderGradient
            animate="on"
            type="waterPlane"
            wireframe={false}
            uTime={0}
            uSpeed={0.15}
            uStrength={2.5}
            uDensity={1.2}
            uFrequency={5}
            uAmplitude={4}
            positionX={0}
            positionY={0}
            positionZ={0}
            rotationX={0}
            rotationY={0}
            rotationZ={230}
            color1="#881124"
            color2="#3D1A25"
            color3="#1A0D10"
            cAzimuthAngle={180}
            cPolarAngle={75}
            cDistance={2.5}
            cameraZoom={9}
            envPreset="city"
            reflection={0.05}
            lightType="env"
            brightness={1.0}
            grain="off"
          />
        </ShaderGradientCanvas>
      )
    }

    return Scene
  },
  { ssr: false }
)

export default function ShaderGradientBg() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <GradientScene />
    </div>
  )
}
