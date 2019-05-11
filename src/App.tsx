import React from 'react'
import './App.css'
import {AspectRatio, ASPECT_RATIOS} from './AspectRatio'

// remember help display setting?  Or hide on add video?  hide on add only if already hidden?
// add logo
// add whole thing as repository and configure gh-pages deploy
// make commands responsive when no video present
// refence react as third party library on cdn?

type ObjectFit = "fill"|"contain"|"cover"|"scale-down"
const OBJECT_FITS = ['contain', 'cover', 'fill', 'scale-down'] as ObjectFit[]

const HELP = <section id="help">
	<h2>Usage</h2>
	<p>Drag and drop any number of videos to auto-play in an optimally arranged grid.</p>
	<p>Videos start half-way in and loop, ensuring immediate, continuous action, but also start muted to avoid chaotic, clashing audio and prevent disturbing others.</p>
	<h2>Shortcuts</h2><ol>
		<li><em>C:</em> Clone video (+1m)</li>
		<li><em>D:</em> Delete video</li>
		<li><em>H:</em> Toggle help</li>
		<li><em>I:</em> Toggle info overlay</li>
		<li><em>M:</em> Toggle mute</li>
		<li><em>S:</em> Change video scaling</li>
		<li><em>X:</em> Change aspect ratio</li>
		<li><em>← →:</em> Skip 1m</li>
		<li><em>Ctrl+W:</em> Close tab</li>
		<li><em>F / F11:</em> Toggle fullscreen</li>
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

function adjustDisplayTime(display:Display, adjustment:number) {
	const vid = display.video
	if (!vid) return
	let end = vid.seekable.end(0)
	let diff = end - vid.currentTime
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
	video?:HTMLVideoElement,
	triggerResize:boolean
}

interface BDVideoProps {
	display:Display,
	objectFit:ObjectFit,
	size: {
		width: number,
		height: number
	},
	onMouseOver:()=>void,
	onMouseOut:()=>void,
	onLoad:()=>void
	onError:()=>void
}

class BDVideo extends React.Component<BDVideoProps> {
	video = React.createRef<HTMLVideoElement>()

	componentDidMount() {
		const {display, onLoad, onError} = this.props
		const video = this.video.current!
		display.video = video
		if (display.startTime) {
			video.currentTime = display.startTime
		} else {
			video.onerror = onError
			video.onloadeddata = e => video.currentTime = video.seekable.end(0) / 2
			video.onloadedmetadata = onLoad
		}
	}

	render() {
		const {size, onMouseOver, onMouseOut, display, objectFit} = this.props

		return <div className="display" {...size} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
			<div className="display-border" style={{width: `${size.width}px`, height: `${size.height}px`}}></div>
			<video controls={true} autoPlay={true} loop={true} muted={true} src={display.url}
			{...size} ref={this.video} style={{objectFit}} />
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
	errorDisplays:Display[]
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
		"i": () => this.setState({showInfo: !this.state.showInfo}),
		"s": () => this.nextObjectFit(),
		"x": () => this.nextDimensionRatio()
	} as ActionControls

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
			errorDisplays: []
		}

		window.onresize = () => this.updateDimensions()

		window.onkeydown = ev => {
			const key = ev.key
			const altCase = key.toLowerCase() == key ? key.toUpperCase() : key.toLowerCase()
			
			if (key in this.globalActions) {
				this.globalActions[key]()
				return
			} else if (altCase in this.globalActions) {
				this.globalActions[altCase]()
				return
			}

			const {activeDisplay} = this.state
			if (!activeDisplay) return

			const displayActions = {
				"Delete": () => this.deleteDisplay(activeDisplay),
				"d": () => this.deleteDisplay(activeDisplay),
				"c": () => this.copyDisplay(activeDisplay),
				"ArrowLeft": () => adjustDisplayTime(activeDisplay, -60),
				"ArrowRight": () => adjustDisplayTime(activeDisplay, 60),
				"m": () => toggleMute(activeDisplay.video)
			} as ActionControls

			if (key in displayActions) {
				displayActions[key]()
			} else if (altCase in displayActions) {
				displayActions[altCase]()
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
				triggerResize: firstBatch
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
		if (!viewport) return {width: 1, height: 1}
		if (displays.length < 2) return {width: viewport.x, height: viewport.y}

		let smallest = 0, bestrows = 0, bestcols = 0
		for (let rows = 1; rows < displays.length; rows++) {
			let cols = Math.ceil(displays.length / rows)
			let x = viewport.x / cols
			let y = viewport.y * aspectRatio.ratio / rows

			// if neither are smaller, replace
			if (smallest <= x && smallest <= y) {
				smallest = Math.min(x, y)
				bestrows = rows
				bestcols = cols
			} else {
				break
			}
		}

		return {
			width: viewport.x / bestcols,
			height: viewport.y / bestrows
		}
	}

	updateDimensions() {
		const vp = this.viewport.current!
		const viewport = {x: vp.clientWidth, y: vp.clientHeight}
		this.setState({viewport})
	}

	copyDisplay(display:Display) {
		const activeVideo = display.video
		const maxId = this.state.maxId + 1
		let startTime = activeVideo!.currentTime + 60
		if (startTime > activeVideo!.seekable.end(0)) startTime = 0
		const newDisplay = {
			id: maxId,
			file: display.file,
			url: display.url,
			startTime,
			triggerResize: false
		}
		this.setState({ maxId, displays: this.state.displays.concat(newDisplay)})
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

	render() {
		const {displays, errorDisplays, activeDisplay, lastDisplay, showInfo, showHelp, aspectRatio, objectFit} = this.state
		const size = this.getVideoSize()
		return <>
			{showInfo && lastDisplay && <div id="info-toggle">
				{aspectRatio.name}<br />
				Scale strategy: {objectFit}<br />
				{lastDisplay.file.name}
			</div>}
			<main ref={this.viewport}>
				{displays.map(i => <BDVideo size={size} objectFit={objectFit} key={i.id} display={i}
					onMouseOver={() => this.setState({activeDisplay: i, lastDisplay: i})}
					onMouseOut={() => this.setState({activeDisplay: undefined})}
					onLoad={() => i.triggerResize && this.setRecommendedAspectRatio()}
					onError={() => this.handleVideoError(i)} />)}
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