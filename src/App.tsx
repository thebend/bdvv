import React from 'react'
import './App.css'
import {AspectRatio, ASPECT_RATIOS} from './AspectRatio'

// TODO: add logo
// TODO: refence react as third party library on cdn?

// TODO: fix this TypeScript hack
type ObjectFit = "fill"|"contain"|"cover"|"scale-down"
const OBJECT_FITS = ['contain', 'cover', 'fill', 'scale-down'] as ObjectFit[]

const SPLASH = <section id="splash">
	<p>Videos start half-way in and loop, ensuring immediate, continuous action, but also start muted to avoid chaotic, clashing audio and prevent disturbing others.</p>
</section>

const HELP = <section id="help">
	<h2>Usage</h2>
	<p>Drag and drop any number of videos to auto-play in an optimally arranged grid.</p>
	<p>Videos start half-way in and loop, ensuring immediate, continuous action, but also start muted to avoid chaotic, clashing audio and prevent disturbing others.</p>
	<h2>Shortcuts</h2><ol>
		<li><em>C:</em> Clone video (+1m)</li>
		<li><em>D:</em> Distribute times</li>
		<li><em>H:</em> Toggle help</li>
		{/* <li><em>I:</em> Toggle info overlay</li> */}
		<li><em>M:</em> Toggle mute</li>
		<li><em>R:</em> Delete video</li>
		<li><em>S:</em> Change video scaling</li>
		<li><em>X:</em> Change aspect ratio</li>
		<li><em>← →:</em> Skip 1m</li>
		<li><em>Shift ← →:</em> Skip 10%</li>
		<li><em>Ctrl ← →:</em> Change speed</li>
		<li><em>Shift+S</em> Sync speeds</li>
		<li><em>Ctrl+W:</em> Close tab</li>
		<li><em>F / F11:</em> Toggle fullscreen</li>
		<li><em>I / O:</em> Toggle in / out time</li>
		<li><em>OO:</em> Restart video</li>
		<li><em>2-9:</em> Fill 2-9 size grid</li>
		<li><em>Drag&amp;Drop:</em> Reorder videos</li>
	</ol>
	<footer>
		<h2>Privacy Disclaimer</h2>
		<p>This tool records <b>no</b> filenames, screen grabs, or any other methods of identifying the actual contents of any video.  Only metadata about a video's format (codec, file size, resolution, and duration) may be recorded.</p>
	</footer>
</section>

function stopDragDrop(e:Event) {
	e.preventDefault()
	e.stopPropagation()
}

function toggleMute(video?:HTMLVideoElement) {
	if (!video) return
	video.muted = !video.muted
}

interface IOMarkerProps {
	offset:number,
	xPadding:number,
	color:string
}
function IOMarker({offset, xPadding, color}:IOMarkerProps) {
	const diameter = 10
	const yPadding = 16
	return <svg className="iomarker" width={diameter} height={diameter} style={{bottom: yPadding + (diameter/2), left: xPadding + offset - (diameter/2)}} viewBox={`0 0 2 2`}>
		<circle cx={1} cy={1} r={1} fill={color} />
	</svg>
}

function adjustDisplayTime(display:Display, adjustment:number, percentage:boolean = false) {
	const vid = display.video
	if (!vid) return
	const end = vid.duration
	if (percentage) {
		adjustment = end * adjustment
	}
	const diff = end - vid.currentTime
	if (adjustment > diff) {
		vid.currentTime = adjustment - diff
	} else {
		vid.currentTime = vid.currentTime + adjustment
	}
}

interface Display {
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
	thumbnail?:{
		offsetX:number,
		timestamp:number
	}
}

class BDVideo extends React.Component<BDVideoProps, BDVideoState> {
	video = React.createRef<HTMLVideoElement>()
	thumbnail = React.createRef<HTMLVideoElement>()

	timelineMargin = 24
	thumbnailWidth = 196

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

	componentDidUpdate() {
		const {playbackRate} = this.props
		const video = this.video.current!
		const rate = playbackRate || 1
		video.playbackRate = rate
		this.setIO()
		const thumbnail = this.thumbnail.current
		const thumbData = this.state.thumbnail
		if (thumbnail && thumbData) {
			thumbnail.currentTime = thumbData.timestamp
		}
	}

	componentDidMount() {
		const {display, onLoad, onError, onDrag} = this.props
		const video = this.video.current!
		display.video = video
		if (display.startTime) {
			video.currentTime = display.startTime
		} else {
			video.onerror = onError
			video.onloadeddata = e => video.currentTime = video.duration / 2
			video.onloadedmetadata = onLoad
		}
		video.ondragstart = e => {
			const target = e.target! as HTMLVideoElement
			const distanceFromBottom = target.height - e.offsetY
			if (distanceFromBottom < 80) {
				e.preventDefault()
				return
			}
			onDrag(display)
		}
		video.onmousemove = e => {
			const distanceFromBottom = video.height - e.layerY
			if (distanceFromBottom > 50) {
				this.setState({thumbnail: undefined})
			} else {
				const areaWidth = video.width - (this.timelineMargin * 2)
				const videoPercentage = (e.layerX - this.timelineMargin) / areaWidth 
				const targetTime = video.duration * videoPercentage
				this.setState({
					thumbnail: {
						offsetX: e.layerX - (this.thumbnailWidth / 2),
						timestamp: targetTime
					}
				})
			}
		}
		video.onmouseout = e => {
			this.setState({thumbnail: undefined})
		}
		this.setIO()
	}

	getIO() {
		const {inTime, outTime} = this.props
		const video = this.video.current!

		if (inTime || outTime) {
			const xPadding = video.width * .02
			const duration = video.duration
			const ip = inTime || 0
			const op = outTime || duration
			const timelineWidth = video.width - (xPadding*2)
			const ix = (ip / duration) * timelineWidth
			const ox = (op / duration) * timelineWidth
			return <>
				<IOMarker xPadding={xPadding} offset={ix} color="green" />
				<IOMarker xPadding={xPadding} offset={ox} color="red" />
			</>
		}
	}

	render() {
		const {size, onMouseOver, onMouseOut, display, objectFit, showOverlay, playbackRate} = this.props
		const {thumbnail} = this.state

		return <div className="display" {...size} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
			<div className="display-border" style={{width: `${size.width}px`, height: `${size.height}px`}}>{showOverlay && `${display.file.name}${playbackRate == 1 ? "" : " ("+playbackRate+"x)"}`}</div>
			{showOverlay && this.getIO()}
			{thumbnail && <video controls={false} autoPlay={false} loop={false} muted={true} src={display.url} width={this.thumbnailWidth} className="thumbnail" ref={this.thumbnail} style={{left: thumbnail.offsetX}} />}
			<video controls={true} autoPlay={true} loop={true} muted={true} src={display.url} draggable={true}
				{...size} ref={this.video} style={{objectFit}} title={display.file.name} />
		</div>
	}
}

interface Dimensions {
	x:number,
	y:number
}

interface AppState {
	showInfo:boolean,
	showHelp:boolean,
	displays:Display[],
	maxId:number,
	activeDisplay?:Display,
	lastDisplay?:Display,
	viewport?:Dimensions,
	ratioIndex:number,
	aspectRatio:AspectRatio,
	objectFitIndex:number,
	objectFit:ObjectFit,
	firstBatch:boolean,
	errorDisplays:Display[],
	dragSrc?:Display
}

interface ActionControls {
	[key:string]: ()=>void
}

function toggleFullscreen() {
	if (!document.fullscreenEnabled) return
	if (document.fullscreenElement) {
		document.exitFullscreen()
	} else {
		document.body.requestFullscreen()
	}
}

class App extends React.Component<{},AppState> {
	viewport:React.RefObject<HTMLElement>
	globalActions = {
		"f": () => toggleFullscreen(),
		"h": () => this.setState({showHelp: !this.state.showHelp}),
		// "i": () => this.setState({showInfo: !this.state.showInfo}),
		"s": () => this.nextObjectFit(),
		"x": () => this.nextDimensionRatio()
	} as ActionControls

	syncPlaybackRates(playbackRate:number) {
		const {displays} = this.state
		displays.forEach(i => i.playbackRate = playbackRate)
		this.setState({displays}) 
	}

	distributeTimes(display:Display) {
		const {displays} = this.state
		const matchingDisplays = displays.filter(i => i.file == display.file)
		const di = matchingDisplays.indexOf(display)
		// start with target display so it keeps its current time, bump up from there looping back to start
		const orderedDisplays = [display, ...matchingDisplays.slice(di+1), ...matchingDisplays.slice(0, di)]

		const t1 = display.video!.currentTime
		const duration = display.video!.duration
		const spacing = duration / orderedDisplays.length
		orderedDisplays.forEach((v, i) => {
			const targetTime = t1 + (spacing * i)
			// loop time back to beginning once we exceed end of video
			v.video!.currentTime = targetTime < duration ? targetTime : targetTime - duration
		})
	}

	fillGrid(display:Display, count:number) {
		const {displays} = this.state
		const additions = count - displays.length
		if (additions < 1) return
		const newDisplays = [...Array(additions)].map((_, i) => {
			const newDisplay = this.copyDisplay(display)
			newDisplay.id += i
			return newDisplay
		})
		this.setState({
			displays: displays.concat(newDisplays),
			maxId: newDisplays.pop()!.id
		})
	}

	constructor(props:{}) {
		super(props)
		this.viewport = React.createRef<HTMLElement>()
		this.state = {
			showInfo: false,
			showHelp: true,
			displays: [],
			maxId: 0,
			ratioIndex: 0,
			aspectRatio: ASPECT_RATIOS[0],
			objectFitIndex: 0,
			objectFit: OBJECT_FITS[0],
			firstBatch: true,
			errorDisplays: [],
		}

		window.onresize = () => this.updateDimensions()

		window.onkeydown = ev => {
			const key = ev.key.toLowerCase()
			if (key in this.globalActions && !ev.shiftKey && !ev.ctrlKey) {
				this.globalActions[key]()
				return
			}

			const {activeDisplay} = this.state
			if (!activeDisplay) return

			if (ev.shiftKey) {
				const shiftDisplayActions = {
					"arrowleft": () => adjustDisplayTime(activeDisplay, -.1, true),
					"arrowright": () => adjustDisplayTime(activeDisplay, .1, true),
					"s": () => this.syncPlaybackRates(activeDisplay.playbackRate)
				} as ActionControls
				key in shiftDisplayActions && shiftDisplayActions[key]()
			} else if (ev.ctrlKey) {
				const ctrlDisplayActions = {
					"arrowleft": () => this.adjustVideoSpeed(activeDisplay, 0.5),
					"arrowright": () => this.adjustVideoSpeed(activeDisplay, 2)
				} as ActionControls
				key in ctrlDisplayActions && ctrlDisplayActions[key]()
			} else {
				const displayActions = {
					"delete": () => this.deleteDisplay(activeDisplay),
					"c": () => this.addDisplayCopy(activeDisplay),
					"d": () => this.distributeTimes(activeDisplay),
					"i": () => this.setVideoIO(activeDisplay, "in"),
					"o": () => this.setVideoIO(activeDisplay, "out"),
					"m": () => toggleMute(activeDisplay.video),
					"r": () => this.deleteDisplay(activeDisplay),
					"arrowleft": () => adjustDisplayTime(activeDisplay, -60),
					"arrowright": () => adjustDisplayTime(activeDisplay, 60),
				} as ActionControls
				key in displayActions && displayActions[key]()
				if (key >= "2" && key <= "9") {
					this.fillGrid(activeDisplay, parseInt(key))
					this.distributeTimes(activeDisplay)
				}
			}
		}

		document.ondragover = stopDragDrop
		document.ondragenter = stopDragDrop
		document.ondragleave = stopDragDrop

		document.ondrop = (e:DragEvent) => {
			stopDragDrop(e)
			if (!e.dataTransfer) return
			const {firstBatch} = this.state
			let droppedFiles = e.dataTransfer.files as FileList
			const videoFiles = Array.from(droppedFiles).filter(i => i.type.startsWith('video/'))
			let maxId = this.state.maxId
			const newDisplays = videoFiles.map(file => { return {
				id: ++maxId,
				file,
				url: URL.createObjectURL(file),
				triggerResize: firstBatch,
				playbackRate: 1
			} as Display})

			this.setState({
				displays: this.state.displays.concat(newDisplays),
				maxId,
				firstBatch: false,
				// hide help if we are adding videos
				showHelp: this.state.showHelp && videoFiles.length == 0
			})
		}
	}

	getVideoSize() {
		const {displays, aspectRatio, viewport} = this.state
		// assume minimum size if no viewport (shouldn't happen)
		if (!viewport) return {width: 1, height: 1}
		// if only one display, use full size
		if (displays.length < 2) return {width: viewport.x, height: viewport.y}

		// try every number of rows up to a dedicated row for each video
		let bestArea = 0, bestrows = 0, bestcols = 0
		const videoRatio = aspectRatio.ratio
		for (let rows = 1; rows <= displays.length; rows++) {
			// get the necessary number of columns with a given number of rows
			const cols = Math.ceil(displays.length / rows)
			// this determines the size of the resulting box
			const x = viewport.x / cols, y = viewport.y / rows
			// actual video dimensions will depend on ratio within the display box, being shrunk on one side
			let vx = x, vy = y
			if (videoRatio > x/y) {
				vy = vx / videoRatio
			} else {
				vx = vy * videoRatio
			}
			const videoArea = vx * vy
			// if this isn't an improvement, continue looking
			if (videoArea < bestArea) continue
			// otherwise save this as best situation
			bestArea = videoArea
			bestrows = rows, bestcols = cols
		}

		return {
			width: viewport.x / bestcols,
			height: viewport.y / bestrows
		}
	}

	adjustVideoSpeed(display:Display, adjustment:number) {
		display.playbackRate = display.playbackRate * adjustment
		this.setState({displays: this.state.displays})
	}

	setVideoIO(display:Display, mode:"in"|"out") {
		if (mode in display) {
			delete display[mode]
		} else {
			display[mode] = display.video!.currentTime
		}
		// not sure if this way of updating the display will work
		this.setState({displays: this.state.displays})
	}

	updateDimensions() {
		const vp = this.viewport.current!
		const viewport = {x: vp.clientWidth, y: vp.clientHeight}
		this.setState({viewport})
	}

	copyDisplay(display:Display) {
		const activeVideo = display.video!
		const maxId = this.state.maxId + 1
		let startTime = activeVideo.currentTime + 60
		if (startTime > activeVideo.duration) startTime = 0
		const newDisplay = {
			id: maxId,
			file: display.file,
			url: display.url,
			playbackRate: display.playbackRate,
			startTime,
			triggerResize: false
		}
		return newDisplay
	}

	addDisplayCopy(display:Display) {
		const newDisplay = this.copyDisplay(display)
		this.setState({
			maxId: newDisplay.id,
			displays: this.state.displays.concat(newDisplay)
		})
	}

	deleteDisplay(display:Display) {
		this.setState({ displays: this.state.displays.filter(i => i != display) })
	}

	nextDimensionRatio() {
		let i = this.state.ratioIndex + 1
		if (i >= ASPECT_RATIOS.length) i = 0
		this.setState({
			ratioIndex: i,
			aspectRatio: ASPECT_RATIOS[i]
		})
	}

	nextObjectFit() {
		let i = this.state.objectFitIndex + 1
		if (i >= OBJECT_FITS.length) i = 0
		this.setState({
			objectFitIndex: i,
			objectFit: OBJECT_FITS[i]
		})
	}

	componentDidMount() {
		this.updateDimensions()
	}

	getAspectRatios() {
		return this.state.displays.map(i => i.video!.videoWidth / i.video!.videoHeight)
	}

	getRecommendedAspectRatioIndex() {
		const avgRatio = this.getAspectRatios().reduce((a,b) => a + b, 0) / this.state.displays.length
		const closestRatio = [...ASPECT_RATIOS].sort((a, b) => Math.min(a.ratio / avgRatio, avgRatio / a.ratio) - Math.min(b.ratio/avgRatio, avgRatio / b.ratio)).pop()
		const i = ASPECT_RATIOS.findIndex(i => i.name == closestRatio!.name)
		return i
	}

	setRecommendedAspectRatio() {
		const i = this.getRecommendedAspectRatioIndex()
		this.setState({
			aspectRatio: ASPECT_RATIOS[i],
			ratioIndex: i
		})
	}

	handleVideoError(display:Display) {
		const {displays, errorDisplays} = this.state
		errorDisplays.push(display)
		this.setState({
			displays: displays.filter(i => i != display),
			errorDisplays
		})
	}

	reorderDisplays(dest:EventTarget) {
		const {displays, dragSrc} = this.state
		if (!dragSrc) return
		const destDisplay = displays.filter(i => i.video == dest).pop() || displays[displays.length-1]
		const si = displays.indexOf(dragSrc)
		const tmpDisplays = [...displays.slice(0, si), ...displays.slice(si+1)]
		const di = tmpDisplays.indexOf(destDisplay)
		const newDisplays = [...tmpDisplays.slice(0, di+1), dragSrc, ...tmpDisplays.slice(di+1)]
		this.setState({ displays: newDisplays })
	}

	render() {
		const {displays, errorDisplays, activeDisplay, lastDisplay, showInfo, showHelp, aspectRatio, objectFit} = this.state
		const size = this.getVideoSize()
		return <>
			{showInfo && lastDisplay && <div id="info-toggle">
				{aspectRatio.name}<br />
				Scale strategy: {objectFit}<br />
				{lastDisplay.file.name}
			</div>}
			<main ref={this.viewport}
				onDrop={e => this.reorderDisplays(e.target)}>
				{displays.length == 0 && SPLASH}
				{displays.map(i => <BDVideo size={size} objectFit={objectFit} key={i.id} display={i}
					showOverlay={i == activeDisplay}
					playbackRate={i.playbackRate}
					onDrag={display => this.setState({dragSrc: display})}
					onMouseOver={() => this.setState({activeDisplay: i, lastDisplay: i})}
					onMouseOut={() => this.setState({activeDisplay: undefined})}
					onLoad={() => i.triggerResize && this.setRecommendedAspectRatio()}
					onError={() => this.handleVideoError(i)}
					inTime={i.in} outTime={i.out}
				/>)}
			</main>
			{errorDisplays.length > 0 && <section id="errors">
				<h2>Errors</h2><ol>
					{errorDisplays.map((display, i) => <li key={i}>{display.file.name} ({display.file.type})</li>)}
				</ol>
				<p>Only videos supported by your web browser will play successfully.  <code>.mp4</code> and <code>.webm</code> files are good bets.</p>
				<form onSubmit={() => this.setState({errorDisplays: []})}><button>Dismiss</button></form>
			</section>}
			{showHelp && HELP}
		</>
	}
}

export default App