import React from 'react'
import { ObjectFitProperty } from 'csstype'
import { fullscreenElement } from './FullScreen'
import { margins, browser, msBrowser } from './browser'
import { Thumbnail } from './Thumbnail'
import { IOBar } from './IOBar'
import './BDVideo.css'

export type Display = {
	id:string
	file:File
	url:string
	startTime?:number
	in?:number
	out?:number
	video?:HTMLVideoElement
	// triggerResize:boolean
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

const tryActions = (actions:{[key:string]:()=>void}, key:string) =>
	key in actions && actions[key]()

type ThumbnailState = {
	offset:number // x-axis mouse position
	timestamp:number
}

const dragMargin = 80
const thumbnailMargin = margins.bottom + 8

const useElement = <T,>() => {
	const [element, setElement] = React.useState<T>()
	const ref = React.useCallback((i:T)=>setElement(i), [])
	return [element!, ref] as const
}

const overlayDuration = 3000
export function BDVideo({showThumbnail, display,
	onLoad, onError, onDrag, size, onMouseOver, onMouseOut,
	objectFit, showOverlay, removeCallback, copyCallback, exclusiveCallback,
	inCallback, outCallback, speedCallback}:BDVideoProps) {

	const [v, videoRef] = useElement<HTMLVideoElement>()

	const [overlayTimeout, setOverlayTimeout] = React.useState<NodeJS.Timeout|undefined>()
	const [thumbnailState, setThumbnailState] = React.useState<ThumbnailState|undefined>()

	React.useEffect(() => {
		if (!v) return
		v.ontimeupdate = e => {
			const pastOut = display.out && display.out< v.currentTime
			const beforeIn = display.in && display.in > v.currentTime
			if (pastOut || beforeIn) v.currentTime = display.in || 0
		}
		v.addEventListener('mouseover', e=>v.focus())
	}, [display.in, display.out, v])

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
		v.playbackRate = display.playbackRate
	}, [display.playbackRate, v])

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

	const adjustDisplayTime = (adjustment:number, percentage:boolean = false) => {
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

	const handleDisplayKeyDown = (ev:React.KeyboardEvent<HTMLDivElement>) =>
		tryActions(
			ev.shiftKey ? shiftDisplayActions : displayActions,
			ev.key.toLowerCase()
		)

	return <div className="display" {...size} onMouseOver={onMouseOver} onMouseOut={onMouseOut} onKeyDown={handleDisplayKeyDown}>
		{overlayTimeout && <div className="display-border" style={{...size, pointerEvents: msBrowser ? 'none' : 'auto'}}>
			{`${display.file.name}${display.playbackRate === 1 ? "" : " ("+display.playbackRate+"x)"}`}
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
		{showOverlay && <IOBar inTime={display.in} outTime={display.out} video={v} />}
		{showThumbnail && thumbnailState && <Thumbnail src={display.url} {...thumbnailState} />}
		<video controls={true} autoPlay={true} loop={true} muted={true} ref={videoRef}
			src={display.url} draggable={!msBrowser} {...size} style={{objectFit}} />
	</div>
}