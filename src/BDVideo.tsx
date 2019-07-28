import React from 'react'
import { ObjectFitProperty } from 'csstype'
import { fullscreenElement } from './FullScreen'
import { margins, browser, msBrowser } from './browser'
import { IOMarker } from './components/IOMarker'
import './BDVideo.css'

export type Display = {
	id:string
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
	offset:number // x-axis mouse position
	timestamp:number
}

const dragMargin = 80
const thumbnailWidth = 196
const thumbnailMargin = margins.bottom + 8

const overlayDuration = 3000
export function BDVideo({inTime, outTime, playbackRate, showThumbnail, display,
	onLoad, onError, onDrag, size, onMouseOver, onMouseOut,
	objectFit, showOverlay, removeCallback, copyCallback, exclusiveCallback,
	inCallback, outCallback, speedCallback}:BDVideoProps) {

	const [video, setVideo] = React.useState<HTMLVideoElement>()
	const v = video!
	const vRef = React.useCallback((node:HTMLVideoElement) => {
		setVideo(node)
	}, [])

	const [overlayTimeout, setOverlayTimeout] = React.useState<NodeJS.Timeout|undefined>()
	const [thumbnailState, setThumbnailState] = React.useState<ThumbnailState|undefined>()

	React.useEffect(() => {
		if (!v) return
		v.ontimeupdate = e => {
			const pastOut = outTime && outTime < v.currentTime
			const beforeIn = inTime && inTime > v.currentTime
			if (pastOut || beforeIn) v.currentTime = inTime || 0
		}
	}, [inTime, outTime, v])

	const hoverThumbnail = React.useCallback((e:MouseEvent) => {
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
			offset: e.layerX,
			timestamp: targetTime
		})
	}, [v])

	React.useEffect(() => {
		if (!v) return
		v.playbackRate = playbackRate
	}, [playbackRate, v])

	React.useEffect(() => {
		if (!v) return
		v.onmouseover = showThumbnail && browser !== 'IE' ? hoverThumbnail : null
	}, [showThumbnail, hoverThumbnail, v])

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
			setOverlayTimeout(setTimeout(()=>setOverlayTimeout(undefined), overlayDuration))
		}
		v.onmouseout = e => {
			setThumbnailState(undefined)
		}
	}, [display, hoverThumbnail, onDrag, onError, onLoad, overlayTimeout, showThumbnail, v])


	function adjustDisplayTime(adjustment:number, percentage:boolean = false) {
		if (percentage) adjustment = v.duration * adjustment
		v.currentTime = (v.currentTime + adjustment + v.duration) % v.duration
	}

	const shiftDisplayActions = {
		"arrowleft": () => adjustDisplayTime(-.1, true),
		"arrowright": () => adjustDisplayTime(.1, true),
		"f": () => v && fullscreenElement(v)
	}
	const displayActions = {
		"m": () => { v.muted = !v.muted },
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
			<button onClick={copyCallback}>C</button>
			<button onClick={exclusiveCallback}>E</button>
			<button onClick={inCallback}>I</button>
			<button onClick={outCallback}>O</button>
			<button onClick={() => speedCallback(2)}>&raquo;</button>
			<button onClick={() => speedCallback(0.5)}>&laquo;</button>
		</div>}
		{showOverlay && <IOBar {...{inTime, outTime}} video={video!} />}
		{showThumbnail && thumbnailState && <Thumbnail src={display.url} {...thumbnailState} />}
		<video controls={true} autoPlay={true} loop={true} muted={true} src={display.url} draggable={!msBrowser}
			{...size} ref={vRef} style={{objectFit}} />
	</div>
}

type ThumbnailProps = {
	src:string
	offset:number
	timestamp:number
	width?:number
}
const Thumbnail = ({src, offset, timestamp, width=thumbnailWidth}:ThumbnailProps) => {
	const video = React.useRef<HTMLVideoElement>(null)
	React.useEffect(() => {
		video.current!.currentTime = timestamp
	}, [timestamp])

	return <video className="thumbnail"
		ref={video}
		controls={false} autoPlay={false} loop={false} muted={true}
		src={src} width={width} style={{left: offset - (width / 2)}} />
}

type IOBarProps = {
	inTime?:number
	outTime?:number
	video:HTMLVideoElement
}

const IOBar = ({inTime, outTime, video}:IOBarProps) => {
	if (!(inTime || outTime)) return <></>
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