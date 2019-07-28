// TODO: import only required polyfills
// import 'react-app-polyfill/ie11'
// import '@babel/polyfill'
// import 'core-js/modules/es6.array.from'

// TODO: refence react as third party library on cdn?
import React from 'react'
import { BDVideo } from './BDVideo'
import Help from './components/Help'
import { toggleFullscreen } from './FullScreen'
import { ErrorDisplay } from './components/ErrorDisplay'
import { Splash } from './components/Splash'
import aspectRatios from './AspectRatios.json'
import './App.css'

import {AppAPI, objectFits} from './AppAPI'
import { useAPI } from './useAPI'
import {getVideoSize} from './getVideoSize'

const avg = (arr:number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

function stopEvent(e:Event) {
	e.preventDefault()
	e.stopPropagation()
}

function tryActions(actions:{[key:string]:()=>void}, key:string) {
	key in actions && actions[key]()
}

function App() {
	const api = useAPI(AppAPI, {
		showHelp: true,
		showThumbnails: true,
		firstLoad: true,
		displays: [],
		errorDisplays: [],
		aspect: aspectRatios[0],
		fit: objectFits[0]
	})

	const viewport = React.useRef<HTMLElement>(null)

	const globalActions = {
		"f": () => toggleFullscreen(),
		"h": api.toggleHelp,
		"s": api.nextFit,
		"t": api.toggleThumbnails,
		"x": api.nextAspect
	}

	const handleResize = () => {
		const i = viewport.current!
		api.setViewport({
			width: i.clientWidth,
			height: i.clientHeight
		})
	}
	React.useLayoutEffect(() => {
		window.onresize = () => handleResize()
		handleResize()
		// eslint-disable-next-line
	}, [])

	React.useEffect(() => {
		document.ondragover = stopEvent
		document.ondragenter = stopEvent
		document.ondragleave = stopEvent
	}, [])

	React.useEffect(() => {
		window.onkeydown = (ev) => {
			const key = ev.key.toLowerCase()
			if (key in globalActions && !ev.shiftKey && !ev.ctrlKey) {
				return globalActions[key as keyof typeof globalActions]()
			}

			const i = api.active
			if (i === undefined) return
			const ctrlDisplayActions = {
				"arrowleft": () => api.adjustActivePlaybackRate(0.5),
				"arrowright": () => api.adjustActivePlaybackRate(2)
			}
			const shiftDisplayActions = {
				"s": () => api.syncPlaybackRates(i.video!.playbackRate),
			}
			const displayActions = {
				"delete": api.removeActive,
				"c": () => api.copyDisplay(i),
				"d": () => api.distributeTimes(i),
				"e": () => api.active && api.setExclusive(api.active),
				"i": () => api.setActiveIO('in'),
				"o": () => api.setActiveIO('out'),
				"r": api.removeActive,
			}

			if (ev.shiftKey) {
				tryActions(shiftDisplayActions, key)
			} else if (ev.ctrlKey) {
				tryActions(ctrlDisplayActions, key)
			} else {
				tryActions(displayActions, key)
				if (key >= "2" && key <= "9") {
					api.addCopies(parseInt(key))
					api.distributeTimes(i)
				}
			}
		}
	}, [api, globalActions])

	React.useEffect(() => {
		document.ondrop = e => {
			stopEvent(e)
			if (!e.dataTransfer) return
			const droppedFiles = e.dataTransfer.files as FileList
			api.addFiles(Array.from(droppedFiles))
		}
	}, [api])

	const getRecommendedAspect = React.useCallback(() => {
		const avgRatio = avg(api.displays.map(i => i.video!.videoWidth / i.video!.videoHeight))
		const closestRatio = [...aspectRatios].sort((a, b) => Math.abs(avgRatio - b.ratio) - Math.abs(avgRatio - a.ratio)).pop()!
		return closestRatio
	}, [api.displays])

	const size = React.useMemo(() => getVideoSize(
		api.aspect.ratio,
		api.displays.length,
		api.viewport || {width: 1, height: 1}
	), [api.aspect, api.displays, api.viewport])

	return <>
		<main ref={viewport}
			onDrop={e => api.reorderDisplays(e.target)}>
			{api.displays.length === 0 && <Splash />}
			{api.displays.map(i => <BDVideo size={size} objectFit={api.fit} key={i.id} display={i}
				showOverlay={i === api.active}
				showThumbnail={api.showThumbnails}
				playbackRate={i.playbackRate}
				onDrag={i => api.setPartialState({dragSrc: i})}
				onMouseOver={() => api.setPartialState({active: i})}
				onMouseOut={()=>api.setPartialState({active: undefined})}
				onLoad={() => i.triggerResize && api.setPartialState({aspect: getRecommendedAspect()})}
				onError={() => api.handleDisplayError()}
				inTime={i.in} outTime={i.out}
				removeCallback={api.removeActive}
				copyCallback={()=>api.copyDisplay(i)}
				exclusiveCallback={() => api.setExclusive(i)}
				staggerCallback={() => api.distributeTimes(i)}
				inCallback={() => api.setActiveIO("in")}
				outCallback={() => api.setActiveIO("out")}
				speedCallback={adjustment => api.adjustActivePlaybackRate(adjustment)}
			/>)}
		</main>
		{api.errorDisplays.length > 0 && <ErrorDisplay errorDisplays={api.errorDisplays} dismissCallback={api.dismissErrors} />}
		{api.showHelp && <Help
			aspectRatio={api.aspect}
			objectFit={api.fit}
			aspectRatioCallback={i=>api.setPartialState({aspect: i})}
			objectFitCallback={i=>api.setPartialState({fit: i})} />}
	</>
}

export default App