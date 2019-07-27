import React from 'react'
import { margins } from '../browser'

type IOMarkerProps = {
	offset:number
	color:string
}

const diameter = 10
export function IOMarker({offset, color}:IOMarkerProps) {
	const style = {
		bottom: margins.bottom + (diameter/2),
		left: margins.left + offset - (diameter/2)
	}
	return <svg className="iomarker"
		width={diameter} height={diameter}
		viewBox={`0 0 2 2`} style={style}>
		<circle cx={1} cy={1} r={1} fill={color} />
	</svg>
}