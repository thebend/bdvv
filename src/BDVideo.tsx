import React from 'react'
import {ObjectFit} from './ObjectFit'
import './BDVideo.css'
import { fullscreenElement } from './FullScreen'

function getBrowser() {
	if (navigator.userAgent.indexOf(' Trident/') > -1) return 'IE'
	if (navigator.userAgent.indexOf(' Edge/') > -1) return 'Edge'
	return 'Chrome'
}

export const browser = getBrowser()
export const msBrowser = ["Edge","IE"].indexOf(browser) > -1

interface ActionControls {
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
const margins = browser == "Chrome" ? VIDEO_MARGINS["chrome"] : VIDEO_MARGINS["edge"]

export interface Display {
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

interface BDVideoProps {
	display:Display
	objectFit:ObjectFit
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

interface BDVideoState {
	thumbnailState?:{
		offsetX:number,
		timestamp:number
	}
}

export class BDVideo extends React.Component<BDVideoProps, BDVideoState> {
	video = React.createRef<HTMLVideoElement>()
	thumbnail = React.createRef<HTMLVideoElement>()

	dragMargin = 80
	thumbnailWidth = 196
	thumbnailMargin = margins.bottom + 8

	constructor(props:BDVideoProps) {
		super(props)
		this.state = {}
	}

	setIO() {
		const {inTime, outTime} = this.props
		const video = this.video.current!
		video.ontimeupdate = e => {
			const pastOut = outTime && outTime < video.currentTime
			const beforeIn = inTime && inTime > video.currentTime
			if (pastOut || beforeIn) video.currentTime = inTime || 0
		}
	}

	hoverThumbnail = (e:MouseEvent) => {
		const video = this.video.current
		if (!video) return
		const distanceFromBottom = video.height - e.layerY
		if (distanceFromBottom > this.thumbnailMargin) {
			this.setState({thumbnailState: undefined})
			return
		}
		const timelineWidth = video.width - margins.left - margins.right
		const videoPercentage = (e.layerX - margins.left) / timelineWidth 
		if (videoPercentage < 0 || videoPercentage > 1) {
			this.setState({thumbnailState: undefined})
			return
		}
		const targetTime = video.duration * videoPercentage
		this.setState({
			thumbnailState: {
				offsetX: e.layerX - (this.thumbnailWidth / 2),
				timestamp: targetTime
			}
		})
	}

	componentDidUpdate() {
		const {playbackRate, showThumbnail} = this.props
		const video = this.video.current!
		const rate = playbackRate || 1
		video.playbackRate = rate
		this.setIO()
		if (showThumbnail && browser != 'IE') {
			const {thumbnailState} = this.state
			const thumbnail = this.thumbnail.current
			if (thumbnail && thumbnailState) {
				thumbnail.currentTime = thumbnailState.timestamp
			}
			video.onmouseover = this.hoverThumbnail
		} else {
			video.onmouseover = null
		}
	}

	componentDidMount() {
		const {display, onLoad, onError, onDrag, showThumbnail} = this.props
		const video = this.video.current!
		display.video = video
		if (display.startTime) {
			video.onload = () => { video.currentTime = display.startTime! }
		} else {
			video.onerror = onError
			video.onloadeddata = e => video.currentTime = video.duration / 2
			video.onloadedmetadata = onLoad
		}
		video.ondragstart = e => {
			const target = e.target! as HTMLVideoElement
			const distanceFromBottom = target.height - e.offsetY
			if (distanceFromBottom < this.dragMargin) {
				e.preventDefault()
				return
			}
			onDrag(display)
		}
		video.onmousemove = showThumbnail && browser != 'IE' ? this.hoverThumbnail : null
		video.onmouseout = e => {
			this.setState({thumbnailState: undefined})
		}
		this.setIO()
	}

	getIO() {
		const {inTime, outTime} = this.props
		const video = this.video.current!

		if (inTime || outTime) {
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
	}

	adjustDisplayTime(adjustment:number, percentage:boolean = false) {
		const video = this.video.current!
		const end = video.duration
		if (percentage) {
			adjustment = end * adjustment
		}
		const diff = end - video.currentTime
		if (adjustment > diff) {
			video.currentTime = adjustment - diff
		} else {
			video.currentTime = video.currentTime + adjustment
		}
	}

	render() {
		const {size, onMouseOver, onMouseOut, display, objectFit, showOverlay, showThumbnail, playbackRate,
			removeCallback, copyCallback, exclusiveCallback, inCallback, outCallback, speedCallback} = this.props
		const {thumbnailState} = this.state

		return <div className="display" {...size} onMouseOver={onMouseOver} onMouseOut={onMouseOut} onKeyDown={ev => {
			const video = this.video.current!
			const key = ev.key.toLowerCase()
			if (ev.shiftKey) {
				const shiftDisplayActions = {
					"arrowleft": () => this.adjustDisplayTime(-.1, true),
					"arrowright": () => this.adjustDisplayTime(.1, true),
					"f": () => fullscreenElement(video)
				} as ActionControls
				key in shiftDisplayActions && shiftDisplayActions[key]()
			} else if (ev.ctrlKey) {
				const ctrlDisplayActions = {
				} as ActionControls
				key in ctrlDisplayActions && ctrlDisplayActions[key]()
			} else {
				const displayActions = {
					"m": () => video.muted = !video.muted,
					"arrowleft": () => this.adjustDisplayTime(-60),
					"arrowright": () => this.adjustDisplayTime(60),
				} as ActionControls
				key in displayActions && displayActions[key]()
			}
			console.log(key)
		}}>
			<div className="display-border" style={{width: `${size.width}px`, height: `${size.height}px`, pointerEvents: msBrowser ? 'none' : 'auto'}}>
				{`${display.file.name}${playbackRate == 1 ? "" : " ("+playbackRate+"x)"}`}
			</div>
			<div className="display-controls">
				<button onClick={removeCallback}>X</button>
				<button onClick={() => copyCallback()}>C</button>
				<button onClick={exclusiveCallback}>E</button>
				<button onClick={inCallback}>I</button>
				<button onClick={outCallback}>O</button>
				<button onClick={() => speedCallback(2)}>&raquo;</button>
				<button onClick={() => speedCallback(0.5)}>&laquo;</button>
			</div>
			{showOverlay && this.getIO()}
			{showThumbnail && thumbnailState && <video controls={false} autoPlay={false} loop={false} muted={true} src={display.url} width={this.thumbnailWidth} className="thumbnail" ref={this.thumbnail} style={{left: thumbnailState.offsetX}} />}
			<video controls={true} autoPlay={true} loop={true} muted={true} src={display.url} draggable={!msBrowser}
				{...size} ref={this.video} style={{objectFit}}
				// title={display.file.name} // causes hover to display title which gets in the way
				/>
		</div>
	}
}

interface IOMarkerProps {
	offset:number,
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
