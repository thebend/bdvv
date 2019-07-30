import React from 'react'
import { IOMarker } from './components/IOMarker'
import { margins } from './browser'

type IOBarProps = {
	inTime?:number
	outTime?:number
	video:HTMLVideoElement
}

export const IOBar = ({inTime, outTime, video}:IOBarProps) => {
	if (!(inTime || outTime)) return null
	const duration = video.duration
	const ip = inTime || 0
	const op = outTime || duration
	const timelineWidth = video.width - margins.left - margins.right
	const ix = (ip / duration) * timelineWidth
	const ox = (op / duration) * timelineWidth
	return <>
		<IOMarker offset={ix} color="gold" />
		<IOMarker offset={ox} color="gold" />
	</>
}