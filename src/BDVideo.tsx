import React from 'react'
import { fullscreenElement } from './FullScreen'
import { ObjectFitProperty } from 'csstype'
import './BDVideo.css'

function getBrowser() {
	if (navigator.userAgent.indexOf(' Trident/') > -1) return 'IE'
	if (navigator.userAgent.indexOf(' Edge/') > -1) return 'Edge'
	return 'Chrome'
}

export const browser = getBrowser()
export const msBrowser = ["Edge","IE"].indexOf(browser) > -1

type ActionControls = {
	[key:string]: ()=>void
}

const VIDEO_MARGINS = {
	"edge": {
		"left": 116,
		"right": 220,
		"bottom": 24
	},
	"chrome": {
		"left": 24,
		"right": 24,
		"bottom": 16
	}
}
const margins = browser === "Chrome" ? VIDEO_MARGINS["chrome"] : VIDEO_MARGINS["edge"]

export type Display = {
	id:number
	file:File
	url:string
	startTime?:number
	in?:number
	out?:number
	video?:HTMLVideoElement
	triggerResize:boolean
	playbackRate:number
}

type BDVideoProps = {
	display:Display
	objectFit:ObjectFitProperty
	size: {
		width:number
		height:number
	}
	showOverlay:boolean
	showThumbnail:boolean
	inTime?:number
	outTime?:number
	playbackRate:number
	overlayDuration?:number
	onMouseOver:()=>void
	onMouseOut:()=>void
	onLoad:()=>void
	onError:()=>void
	onDrag:(display:Display)=>void
	removeCallback:()=>void,
	copyCallback:()=>void,
	exclusiveCallback:()=>void,
	staggerCallback:()=>void,
	inCallback:()=>void,
	outCallback:()=>void,
	speedCallback:(adjustment:number)=>void
}

type ThumbnailState = {
	offsetX:number
	timestamp:number
}

export function BDVideo({inTime, outTime, playbackRate, showThumbnail, display,
	onLoad, onError, onDrag, overlayDuration=3000, size, onMouseOver, onMouseOut,
	objectFit, showOverlay, removeCallback, copyCallback, exclusiveCallback,
	inCallback, outCallback, speedCallback}:BDVideoProps) {

	const [v, setV] = React.useState<HTMLVideoElement>()
	const vRef = React.useCallback((node:HTMLVideoElement) => {
		setV(node)
	}, [])

	const thumbnail = React.useRef<HTMLVideoElement>(null)
	// TODO: set these to null instead of starting and allowing undefined?
	const [overlayTimeout, setOverlayTimeout] = React.useState<NodeJS.Timeout|undefined>()
	const [thumbnailState, setThumbnailState] = React.useState<ThumbnailState|undefined>()

	const dragMargin = 80
	const thumbnailWidth = 196
	const thumbnailMargin = margins.bottom + 8

	React.useEffect(() => {
		if (!v) return
		v.ontimeupdate = e => {
			const pastOut = outTime && outTime < v.currentTime
			const beforeIn = inTime && inTime > v.currentTime
			if (pastOut || beforeIn) v.currentTime = inTime || 0
		}
	}, [inTime, outTime, v])

	function hoverThumbnail(e:MouseEvent) {
		if (!v) return
		const distanceFromBottom = v.height - e.layerY
		if (distanceFromBottom > thumbnailMargin) {
			return setThumbnailState(undefined)
		}
		const timelineWidth = v.width - margins.left - margins.right
		const videoPercentage = (e.layerX - margins.left) / timelineWidth 
		if (videoPercentage < 0 || videoPercentage > 1) {
			return setThumbnailState(undefined)
		}
		const targetTime = v.duration * videoPercentage
		setThumbnailState({
			offsetX: e.layerX - (thumbnailWidth / 2),
			timestamp: targetTime
		})
	}

	React.useEffect(() => {
		if (!v) return
		v.playbackRate = playbackRate
	}, [playbackRate, v])

	React.useEffect(() => {
		if (!v) return
		v.onmouseover = showThumbnail && browser !== 'IE' ? hoverThumbnail : null
	}, [showThumbnail, hoverThumbnail, v])

	React.useEffect(() => {
		const t = thumbnail.current
		// console.log(t)
		if (showThumbnail && browser !== 'IE' && t && thumbnailState) {
			t.currentTime = thumbnailState.timestamp
		}
	}, [showThumbnail, thumbnailState, v])

	function hideTimeout() {
		setOverlayTimeout(undefined)
	}

	React.useEffect(() => {
		if (!v) return
		display.video = v
		if (display.startTime) {
			v.onload = () => { v.currentTime = display.startTime! }
		} else {
			v.onerror = onError
			v.onloadeddata = e => v.currentTime = v.duration / 2
			v.onloadedmetadata = onLoad
		}
		v.ondragstart = e => {
			const target = e.target! as HTMLVideoElement
			const distanceFromBottom = target.height - e.offsetY
			if (distanceFromBottom < dragMargin) {
				e.preventDefault()
				return
			}
			onDrag(display)
		}
		v.onmousemove = e => {
			showThumbnail && browser !== 'IE' && hoverThumbnail(e)
			overlayTimeout && clearTimeout(overlayTimeout)
			setOverlayTimeout(setTimeout(hideTimeout, overlayDuration))
		}
		v.onmouseout = e => {
			setThumbnailState(undefined)
		}
	}, [display, hoverThumbnail, onDrag, onError, onLoad, overlayDuration, overlayTimeout, showThumbnail, v])

	function getIO() {
		if (!(v && inTime && outTime)) return
		const duration = v.duration
		const ip = inTime || 0
		const op = outTime || duration
		const timelineWidth = v.width - margins.left - margins.right
		const ix = (ip / duration) * timelineWidth
		const ox = (op / duration) * timelineWidth
		return <>
			<IOMarker offset={ix} color="gold" />
			<IOMarker offset={ox} color="gold" />
		</>
	}

	function adjustDisplayTime(adjustment:number, percentage:boolean = false) {
		if (!v) return
		const end = v.duration
		if (percentage) {
			adjustment = end * adjustment
		}
		const diff = end - v.currentTime
		if (adjustment > diff) {
			v.currentTime = adjustment - diff
		} else {
			v.currentTime = v.currentTime + adjustment
		}
	}

	const shiftDisplayActions = {
		"arrowleft": () => adjustDisplayTime(-.1, true),
		"arrowright": () => adjustDisplayTime(.1, true),
		"f": () => v && fullscreenElement(v)
	}
	const displayActions = {
		"m": () => { if (!v) return; v.muted = !v.muted},
		"arrowleft": () => adjustDisplayTime(-60),
		"arrowright": () => adjustDisplayTime(60),
	}

	function tryActions(actions:{[key:string]:()=>void}, key:string) {
		key in actions && actions[key]()
	}
	function handleDisplayKeyDown(ev:React.KeyboardEvent<HTMLDivElement>) {
		const key = ev.key.toLowerCase()
		if (ev.shiftKey) {
			tryActions(shiftDisplayActions, key)
		} else {
			tryActions(displayActions, key)
		}
	}

	return <div className="display" {...size} onMouseOver={onMouseOver} onMouseOut={onMouseOut} onKeyDown={handleDisplayKeyDown}>
		{overlayTimeout && <div className="display-border" style={{...size, pointerEvents: msBrowser ? 'none' : 'auto'}}>
			{`${display.file.name}${playbackRate === 1 ? "" : " ("+playbackRate+"x)"}`}
		</div>}
		{overlayTimeout && <div className="display-controls">
			<button onClick={removeCallback}>X</button>
			<button onClick={() => copyCallback()}>C</button>
			<button onClick={exclusiveCallback}>E</button>
			<button onClick={inCallback}>I</button>
			<button onClick={outCallback}>O</button>
			<button onClick={() => speedCallback(2)}>&raquo;</button>
			<button onClick={() => speedCallback(0.5)}>&laquo;</button>
		</div>}
		{showOverlay && getIO()}
		{showThumbnail && thumbnailState && <video controls={false} autoPlay={false} loop={false} muted={true} src={display.url} width={thumbnailWidth} className="thumbnail" ref={thumbnail} style={{left: thumbnailState.offsetX}} />}
		<video controls={true} autoPlay={true} loop={true} muted={true} src={display.url} draggable={!msBrowser}
			{...size} ref={vRef} style={{objectFit}} />
	</div>
}

type IOMarkerProps = {
	offset:number
	color:string
}
function IOMarker({offset, color}:IOMarkerProps) {
	const diameter = 10
	const yMargin = margins.bottom
	return <svg className="iomarker" width={diameter} height={diameter} viewBox={`0 0 2 2`}
		style={{bottom: yMargin + (diameter/2), left: margins.left + offset - (diameter/2)}}
	>
		<circle cx={1} cy={1} r={1} fill={color} />
	</svg>
}
