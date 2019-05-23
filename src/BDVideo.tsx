import React from 'react'

// TODO: fix this TypeScript hack
export type ObjectFit = "fill"|"contain"|"cover"|"scale-down"
export const OBJECT_FITS = ['contain', 'cover', 'fill', 'scale-down'] as ObjectFit[]

function getBrowser() {
	if (navigator.userAgent.indexOf(' Trident/') > -1) return 'IE'
	if (navigator.userAgent.indexOf(' Edge/') > -1) return 'Edge'
	return 'Chrome'
}

export const browser = getBrowser()
export const msBrowser = ["Edge","IE"].indexOf(browser) > -1

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
	id:number,
	file:File,
	url:string,
	startTime?:number,
	in?:number,
	out?:number,
	video?:HTMLVideoElement,
	triggerResize:boolean,
	playbackRate:number
}

interface BDVideoProps {
	display:Display,
	objectFit:ObjectFit,
	size: {
		width:number,
		height:number
	},
	showOverlay:boolean,
	showThumbnail:boolean,
	inTime?:number,
	outTime?:number,
	playbackRate:number,
	onMouseOver:()=>void,
	onMouseOut:()=>void,
	onLoad:()=>void
	onError:()=>void
	onDrag:(display:Display)=>void
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
		this.hoverThumbnail = this.hoverThumbnail.bind(this)
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

	hoverThumbnail(e:MouseEvent) {
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

	render() {
		const {size, onMouseOver, onMouseOut, display, objectFit, showOverlay, showThumbnail, playbackRate} = this.props
		const {thumbnailState} = this.state

		return <div className="display" {...size} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
			<div className="display-border" style={{width: `${size.width}px`, height: `${size.height}px`, pointerEvents: msBrowser ? 'none' : 'auto'}}>{showOverlay && `${display.file.name}${playbackRate == 1 ? "" : " ("+playbackRate+"x)"}`}</div>
			{showOverlay && this.getIO()}
			{showThumbnail && thumbnailState && <video controls={false} autoPlay={false} loop={false} muted={true} src={display.url} width={this.thumbnailWidth} className="thumbnail" ref={this.thumbnail} style={{left: thumbnailState.offsetX}} />}
			<video controls={true} autoPlay={true} loop={true} muted={true} src={display.url} draggable={!msBrowser}
				{...size} ref={this.video} style={{objectFit}} title={display.file.name} />
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
