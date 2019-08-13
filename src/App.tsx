// TODO: import only required polyfills
// import 'react-app-polyfill/ie11'
// import '@babel/polyfill'
// import 'core-js/modules/es6.array.from'

// TODO: refence react as third party library on cdn?
import React from 'react'
import { BDVideo } from './BDVideo'
import Help from './components/Help'
import { ErrorDisplay } from './components/ErrorDisplay'
import { Splash } from './components/Splash'
import aspectRatios from './AspectRatios.json'
import './App.css'

import {getVideoSize} from './getVideoSize'
import { AppReducer, objectFits, AppAction } from './AppReducer'

const avg = (arr:number[]) => arr.reduce((a, b) => a + b, 0) / arr.length

function stopEvent(e:Event) {
	e.preventDefault()
	e.stopPropagation()
}

type ActionSet = {[key:string]:AppAction}

function App() {
	const [{displays, ...state}, dispatch] = React.useReducer(AppReducer, {
		showHelp: true,
		showThumbnails: true,
		firstLoad: true,
		displays: [],
		errorDisplays: [],
		aspect: aspectRatios[0],
		fit: objectFits[0]
	})

	const viewport = React.useRef<HTMLElement>(null)

	const globalActions:ActionSet = {
		"f": {type: 'toggleFullscreen'},
		"h": {type: 'toggleHelp'},
		"s": {type: 'nextFit'},
		"t": {type: 'toggleThumbnails'},
		"x": {type: 'nextAspect'}
	}

	React.useLayoutEffect(() => {
		const handleResize = () => {
			const i = viewport.current!
			const payload = {
				viewport: {
					width: i.clientWidth,
					height: i.clientHeight
				}
			}
			dispatch({ type: 'setPartialState', payload })
		}
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
				return dispatch(globalActions[key])
			}

			const i = state.activeIndex
			if (i === undefined) return
			const ctrlDisplayActions:ActionSet = {
				"arrowleft": {type: 'adjustActivePlaybackRate', payload: 0.5},
				"arrowright": {type: 'adjustActivePlaybackRate', payload: 2}
			}
			const shiftDisplayActions:ActionSet = {
				"s": {type: 'syncPlaybackRates', payload: displays[i].video!.playbackRate}
			}
			const displayActions:ActionSet = {
				"delete": {type: 'removeActive'},
				"c": {type: 'copyDisplay', payload: i},
				"d": {type: 'distributeTimes', payload: i},
				"e": {type: 'setExclusive', payload: i},
				"i": {type: 'setActiveIO', payload: 'in'},
				"o": {type: 'setActiveIO', payload: 'out'},
				"r": {type: 'removeActive'},
			}

			if (ev.shiftKey) {
				key in shiftDisplayActions && dispatch(shiftDisplayActions[key])
			} else if (ev.ctrlKey) {
				key in ctrlDisplayActions && dispatch(ctrlDisplayActions[key])
			} else {
				key in displayActions && dispatch(displayActions[key])
				if (key >= "1" && key <= "9") {
					dispatch({type: 'addCopies', payload: parseInt(key)})
					dispatch({type: 'distributeTimes', payload: i})
				}
			}
		}
	}, [displays, state.activeIndex, globalActions])

	React.useEffect(() => {
		document.ondrop = e => {
			stopEvent(e)
			if (!e.dataTransfer) return
			const droppedFiles = e.dataTransfer.files as FileList
			dispatch({type: 'addFiles', payload: Array.from(droppedFiles)})
		}
	}, [])

	const getRecommendedAspect = () => {
		const avgRatio = avg(displays.map(i => i.video!.videoWidth / i.video!.videoHeight))
		const closestRatio = [...aspectRatios].sort((a, b) => Math.abs(avgRatio - b.ratio) - Math.abs(avgRatio - a.ratio)).pop()!
		return closestRatio
	}

	const size = React.useMemo(() => getVideoSize(
		state.aspect.ratio,
		displays.length,
		state.viewport || {width: 1, height: 1}
	), [state.aspect, displays, state.viewport])

	return <>
		<main ref={viewport} onDrop={e => dispatch({type: 'reorderDisplays', payload: e.target})}>
			{displays.length === 0 && <Splash />}
			{displays.map((d, i) => <BDVideo key={d.id} size={size} objectFit={state.fit} display={d}
				showThumbnail={state.showThumbnails}
				// TODO: should wait for load of all videos instead of calcualting after each one
				onLoad={() => dispatch({type: 'setPartialState', payload: {aspect: getRecommendedAspect()}})}
				dispatch={dispatch}
				index={i}
			/>)}
		</main>
		{state.errorDisplays.length > 0 && <ErrorDisplay errorDisplays={state.errorDisplays} dismissCallback={()=>dispatch({type: 'dismissErrors'})} />}
		{state.showHelp && <Help
			aspectRatio={state.aspect}
			objectFit={state.fit}
			aspectRatioCallback={i=>dispatch({type: 'setPartialState', payload: {aspect: i}})}
			objectFitCallback={i=>dispatch({type: 'setPartialState', payload: {fit: i}})} />}
	</>
}

export default App