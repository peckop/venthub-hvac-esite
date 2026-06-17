"use client"
import React, { useEffect,useMemo } from "react"
import { BoxGeometry, LatheGeometry, TorusGeometry, Vector2 } from "three"

import { useResolveMaterials } from "../../core"

interface MainChassisProps {
    isSelected?: boolean
    isIsolated?: boolean
    isHidden?: boolean
    onClick?: () => void
    explode?: number
}

// Fan ekseni boyunca Y koordinatı ve o noktadaki yarıçap
const PROFILE_POINTS: [number, number][] = [
  [-0.76, 0.485], [-0.74, 0.496], [-0.72, 0.500], [-0.70, 0.497], [-0.66, 0.490], [-0.60, 0.482],
  [-0.45, 0.470], [-0.30, 0.456], [-0.15, 0.442], [ 0.00, 0.430], [ 0.15, 0.442], [ 0.30, 0.456],
  [ 0.45, 0.470], [ 0.60, 0.482], [ 0.66, 0.490], [ 0.70, 0.497], [ 0.72, 0.500], [ 0.74, 0.496],
  [ 0.76, 0.485], [ 0.76, 0.000]
]

function buildLathePoints(): Vector2[] {
  return PROFILE_POINTS.map(([y, r]) => new Vector2(r, y))
}

const INNER_PROFILE_POINTS: [number, number][] = [
  [-0.72, 0.460], [-0.60, 0.455], [-0.45, 0.445], [-0.30, 0.432], [-0.15, 0.418],
  [ 0.00, 0.406], [ 0.15, 0.418], [ 0.30, 0.432], [ 0.45, 0.445], [ 0.60, 0.455], [ 0.72, 0.460]
]

function buildInnerLathePoints(): Vector2[] {
  return INNER_PROFILE_POINTS.map(([y, r]) => new Vector2(r, y))
}

const MainChassis: React.FC<MainChassisProps> = ({
    isSelected,
    isIsolated,
    isHidden,
    onClick
}) => {
  const { galvanizedSteel, chassisInnerMat, safetyOrange } = useResolveMaterials()

  const outerGeo = useMemo(() => new LatheGeometry(buildLathePoints(), 72), [])
  const innerGeo = useMemo(() => new LatheGeometry(buildInnerLathePoints(), 72), [])
  const flangeGeo = useMemo(() => new TorusGeometry(0.493, 0.012, 12, 72), [])
  const ribGeo = useMemo(() => new BoxGeometry(0.008, 1.44, 0.008), [])

  useEffect(() => {
    return () => {
      outerGeo.dispose()
      innerGeo.dispose()
      flangeGeo.dispose()
      ribGeo.dispose()
    }
  }, [outerGeo, innerGeo, flangeGeo, ribGeo])

  if (isHidden || (isIsolated === false)) return null

  const mainMaterial = isSelected ? safetyOrange : galvanizedSteel

  return (
    <group 
        name="MainChassis"
        onClick={(e) => {
            e.stopPropagation()
            onClick?.()
        }}
    >
      <mesh geometry={outerGeo} material={mainMaterial} castShadow receiveShadow />
      <mesh geometry={innerGeo} material={chassisInnerMat} />
      <mesh geometry={flangeGeo} material={mainMaterial} position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow />
      <mesh geometry={flangeGeo} material={mainMaterial} position={[0, -0.72, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow />

      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          geometry={ribGeo}
          material={mainMaterial}
          position={[
            Math.cos((i * Math.PI) / 2) * 0.485,
            0,
            Math.sin((i * Math.PI) / 2) * 0.485,
          ]}
          castShadow
        />
      ))}
    </group>
  )
}

export default MainChassis
