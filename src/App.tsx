// TODO: import only required polyfills
// import 'react-app-polyfill/ie11'
import '@babel/polyfill'
// import 'core-js/modules/es6.array.from'
import React from 'react'
import './App.css'
import { BDVideo, Display } from './BDVideo'
import {AspectRatio, ASPECT_RATIOS} from './AspectRatio'
import Help from './Help'
import { toggleFullscreen } from './FullScreen'
import { ObjectFitProperty } from "csstype"

export const OBJECT_FITS = ['contain', 'cover', 'fill', 'scale-down'] as ObjectFitProperty[]

const avg = (arr:number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

// TODO: refence react as third party library on cdn?

// TODO: add logo
const SPLASH = <section id="splash">
	<p>Auto-play any number of videos or copies of videos in an optimally arranged grid with simple drag-and-drop.  Videos start half-way in and loop, ensuring immediate, continuous immersion, great for scouring surveillance footage, finding the best highlights from your last gaming stream, and more!</p>
	<p>Find your favourite moments quickly with thumbnail scrubbing and keyboard shortcuts to jump ahead in time 1m (→) or 10% (Shift →), or adjust playback speed (Ctrl →).</p>
	<p>Use shortcut keys to rapidly (c)opy or (r)emove displays, set (i)n/(o)ut loop points, (f)ullscreen the display, toggle (m)ute, etc.</p>
	{/* <img src="clipart/surveillance.jpg" alt="Surveillance" />
	<img src="clipart/television.jpg" alt="Television" /> */}
</section>

function stopDragDrop(e:Event) {
	e.preventDefault()
	e.stopPropagation()
}

interface Dimensions {
	x:number,
	y:number
}

interface AppState {
	showHelp:boolean,
	showThumbnails:boolean,
	displays:Display[],
	maxId:number,
	activeDisplay?:Display,
	lastDisplay?:Display,
	viewport?:Dimensions,
	ratioIndex:number,
	aspectRatio:AspectRatio,
	objectFitIndex:number,
	objectFit:ObjectFitProperty,
	firstBatch:boolean,
	errorDisplays:Display[],
	dragSrc?:Display
}

interface ActionControls {
	[key:string]: ()=>void
}

class App extends React.Component<{},AppState> {
	viewport = React.createRef<HTMLElement>()
	globalActions = {
		"f": () => toggleFullscreen(),
		"h": () => this.setState({showHelp: !this.state.showHelp}),
		"s": () => this.nextObjectFit(),
		"t": () => this.setState({showThumbnails: !this.state.showThumbnails}),
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
		this.state = {
			showHelp: true,
			showThumbnails: true,
			displays: [],
			maxId: 0,
			ratioIndex: 0,
			aspectRatio: ASPECT_RATIOS[0],
			objectFitIndex: 0,
			objectFit: OBJECT_FITS[0],
			firstBatch: true,
			errorDisplays: [],
		}

		// const testState = {
		// 	displays: [{
		// 		id: 1,
		// 		file: new File([], "test"),
		// 		url: "2.mp4",
		// 		triggerResize: true,
		// 		playbackRate: 1
		// 	}],
		// 	maxId: 1,
		// 	firstBatch: false,
		// 	showHelp: false
		// }
		// this.state = Object.assign({}, this.state, testState)

		window.onresize = this.updateDimensions

		window.onkeydown = this.handleKeyPress

		document.ondragover = stopDragDrop
		document.ondragenter = stopDragDrop
		document.ondragleave = stopDragDrop
		document.ondrop = this.handleDropEvent
	}

	handleDropEvent = (e:DragEvent) => {
		stopDragDrop(e)
		if (!e.dataTransfer) return
		const {firstBatch} = this.state
		const droppedFiles = e.dataTransfer.files as FileList
		// const videoFiles = Array.from(droppedFiles).filter(i => i.type.startsWith('video/'))
		const videoFiles = Array.from(droppedFiles)
		let maxId = this.state.maxId
		const newDisplays = videoFiles.map(file => ({
			id: ++maxId,
			file,
			url: URL.createObjectURL(file),
			triggerResize: firstBatch,
			playbackRate: 1
		} as Display))

		this.setState({
			displays: this.state.displays.concat(newDisplays),
			maxId,
			firstBatch: false,
			// hide help if we are adding videos
			showHelp: this.state.showHelp && videoFiles.length == 0
		})
	}

	handleKeyPress = (ev:KeyboardEvent) => {
		const key = ev.key.toLowerCase()
		if (key in this.globalActions && !ev.shiftKey && !ev.ctrlKey) {
			this.globalActions[key]()
			return
		}

		const d = this.state.activeDisplay
		if (!d) return

		if (ev.shiftKey) {
			const shiftDisplayActions = {
				"s": () => this.syncPlaybackRates(d.playbackRate),
			} as ActionControls
			key in shiftDisplayActions && shiftDisplayActions[key]()
		} else if (ev.ctrlKey) {
			const ctrlDisplayActions = {
				"arrowleft": () => this.adjustVideoSpeed(d, 0.5),
				"arrowright": () => this.adjustVideoSpeed(d, 2)
			} as ActionControls
			key in ctrlDisplayActions && ctrlDisplayActions[key]()
		} else {
			const displayActions = {
				"delete": () => this.deleteDisplay(d),
				"c": () => this.addDisplayCopy(d),
				"d": () => this.distributeTimes(d),
				"e": () => this.setState({displays: [d]}),
				"i": () => this.setVideoIO(d, "in"),
				"o": () => this.setVideoIO(d, "out"),
				"r": () => this.deleteDisplay(d),
			} as ActionControls
			key in displayActions && displayActions[key]()
			if (key >= "2" && key <= "9") {
				this.fillGrid(d, parseInt(key))
				this.distributeTimes(d)
			}
		}
	}

	getVideoSize() {
		const {displays, aspectRatio, viewport} = this.state
		// assume minimum size if no viewport (shouldn't happen)
		if (!viewport) return {width: 1, height: 1}
		// if only one display, use full size
		if (displays.length < 2) return {width: viewport.x, height: viewport.y}

		// try every number of rows up to a dedicated row for each video
		let bestArea = 0, width = 0, height = 0
		const videoRatio = aspectRatio.ratio
		for (let rows = 1; rows <= displays.length; rows++) {
			// get the necessary number of columns with a given number of rows
			const cols = Math.ceil(displays.length / rows)
			// this determines the size of the resulting box
			const x = Math.floor(viewport.x / cols)
			const y = Math.floor(viewport.y / rows)
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
			width = x, height = y
		}

		return {width, height}
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

	updateDimensions = () => {
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

	getRecommendedAspectRatioIndex() {
		const avgRatio = avg(this.state.displays.map(i => i.video!.videoWidth / i.video!.videoHeight))
		const closestRatio = [...ASPECT_RATIOS].sort((a, b) => Math.abs(avgRatio - b.ratio) - Math.abs(avgRatio - a.ratio)).pop()!
		const i = ASPECT_RATIOS.findIndex(i => i.name == closestRatio.name)
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
		const {displays, errorDisplays, activeDisplay, showThumbnails, showHelp, aspectRatio, objectFit} = this.state
		const size = this.getVideoSize()
		return <>
			<main ref={this.viewport}
				onDrop={e => this.reorderDisplays(e.target)}>
				{displays.length == 0 && SPLASH}
				{displays.map(i => <BDVideo size={size} objectFit={objectFit} key={i.id} display={i}
					showOverlay={i == activeDisplay}
					showThumbnail={showThumbnails}
					playbackRate={i.playbackRate}
					onDrag={display => this.setState({dragSrc: display})}
					onMouseOver={() => this.setState({activeDisplay: i, lastDisplay: i})}
					onMouseOut={() => this.setState({activeDisplay: undefined})}
					onLoad={() => i.triggerResize && this.setRecommendedAspectRatio()}
					onError={() => this.handleVideoError(i)}
					inTime={i.in} outTime={i.out}
					removeCallback={() => this.deleteDisplay(i)}
					copyCallback={() => this.addDisplayCopy(i)}
					exclusiveCallback={() => this.setState({displays: [i]})}
					staggerCallback={() => this.distributeTimes(i)}
					inCallback={() => this.setVideoIO(i, "in")}
					outCallback={() => this.setVideoIO(i, "out")}
					speedCallback={adjustment => this.adjustVideoSpeed(i, adjustment)}
				/>)}
			</main>
			{errorDisplays.length > 0 && <ErrorDisplay errorDisplays={errorDisplays} dismissCallback={() => this.setState({errorDisplays: []})} />}
			{showHelp && <Help
				{...{aspectRatio, objectFit}}
				aspectRatioCallback={aspectRatio => this.setState({aspectRatio})}
				objectFitCallback={objectFit => this.setState({objectFit})} />}
		</>
	}
}

interface ErrorDisplayProps {
	errorDisplays:Display[],
	dismissCallback:()=>void
}
function ErrorDisplay({errorDisplays, dismissCallback}:ErrorDisplayProps) {
	return <section id="errors">
		<h2>Errors</h2><ol>
			{errorDisplays.map((display, i) => <li key={i}>{display.file.name} ({display.file.type})</li>)}
		</ol>
		<p>Only videos supported by your web browser will play successfully.  <code>.mp4</code> and <code>.webm</code> files are good bets.</p>
		<form onSubmit={dismissCallback}><button>Dismiss</button></form>
	</section>
}

export default App