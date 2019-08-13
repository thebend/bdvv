import React from 'react'
import { ObjectFitProperty } from 'csstype'
import { fullscreenElement } from './FullScreen'
import { margins, browser, msBrowser } from './browser'
import { Thumbnail } from './Thumbnail'
import { IOBar } from './IOBar'
import './BDVideo.css'
import { AppAction } from './AppReducer';

export type Display = {
	id:string
	file:File
	url:string
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
	showThumbnail:boolean
	dispatch:(value:AppAction)=>void
	index:number
	onLoad:()=>void
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
	onLoad, size, objectFit, dispatch, index}:BDVideoProps) {

	const [v, videoRef] = useElement<HTMLVideoElement>()

	const [overlayTimeout, setOverlayTimeout] = React.useState<NodeJS.Timeout>()
	const [thumbnailState, setThumbnailState] = React.useState<ThumbnailState>()

	const handleMouseOver = () => {
		// v.focus()
		dispatch({type: 'setPartialState', payload: {activeIndex: index}})
	}
	const handleMouseOut = () => {
		setThumbnailState(undefined)
		dispatch({type: 'setPartialState', payload: {activeIndex: undefined}})
	}
	const handleMouseMove = (e:React.MouseEvent) => {
		overlayTimeout && clearTimeout(overlayTimeout)
		setOverlayTimeout(setTimeout(()=>setOverlayTimeout(undefined), overlayDuration))

		if (!showThumbnail || browser === 'IE') return
		const [layerX, layerY] = [e.nativeEvent.layerX, e.nativeEvent.layerY]
		const distanceFromBottom = v.height - layerY
		if (distanceFromBottom > thumbnailMargin) {
			return setThumbnailState(undefined)
		}
		const timelineWidth = v.width - margins.left - margins.right
		const videoPercentage = (layerX - margins.left) / timelineWidth 
		if (videoPercentage < 0 || videoPercentage > 1) {
			return setThumbnailState(undefined)
		}
		const targetTime = v.duration * videoPercentage
		setThumbnailState({
			offset: layerX,
			timestamp: targetTime
		})
	}

	React.useEffect(() => {
		if (!v) return
		display.video = v
		v.playbackRate = display.playbackRate

		v.onerror = () => dispatch({type: 'handleDisplayError', payload: index})
		v.onloadedmetadata = onLoad
		v.onloadeddata = e => v.currentTime = v.duration / 2
		v.ondragstart = e => {
			const target = e.target! as HTMLVideoElement
			const distanceFromBottom = target.height - e.offsetY
			if (distanceFromBottom < dragMargin) e.preventDefault()
			else dispatch({type: 'setPartialState', payload: {dragSrc: display}})
		}
		v.ontimeupdate = e => {
			const pastOut = display.out && display.out < v.currentTime
			const beforeIn = display.in && display.in > v.currentTime
			if (pastOut || beforeIn) v.currentTime = display.in || 0
		}
	}, [display, v, onLoad, dispatch, index])

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

	return <div className="display"
		onMouseOver={handleMouseOver}
		onMouseMove={handleMouseMove}
		onMouseOut={handleMouseOut}
		onKeyDown={handleDisplayKeyDown}>
		{overlayTimeout && <>
			<div className="display-border" style={{pointerEvents: msBrowser ? 'none' : 'auto'}}>
				{display.file.name}{display.playbackRate !== 1 && ` (${display.playbackRate}x)`}
			</div>
			<div className="display-controls">
				<button onClick={()=>dispatch({type: 'removeActive'})}>X</button>
				<button onClick={()=>dispatch({type: 'copyDisplay', payload: index})}>C</button>
				<button onClick={() => dispatch({type: 'setExclusive', payload: index})}>E</button>
				<button onClick={() => dispatch({type: 'setActiveIO', payload: 'in'})}>I</button>
				<button onClick={() => dispatch({type: 'setActiveIO', payload: 'out'})}>O</button>
				<button onClick={() => dispatch({type: 'adjustActivePlaybackRate', payload: 2})}>&raquo;</button>
				<button onClick={() => dispatch({type: 'adjustActivePlaybackRate', payload: 0.5})}>&laquo;</button>
			</div>
			<IOBar inTime={display.in} outTime={display.out} video={v} />
		</>}
		{showThumbnail && thumbnailState && <Thumbnail src={display.url} {...thumbnailState} />}
		<video controls autoPlay loop muted ref={videoRef}
			src={display.url} draggable={!msBrowser} {...size} style={{objectFit}} />
	</div>
}