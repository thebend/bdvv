import uuid from 'uuid'
import {ObjectFitProperty} from 'csstype'
import {ApiFactoryProps} from './useAPI'
import { Display } from './BDVideo'
import aspectRatios from './AspectRatios.json'

export const objectFits:ObjectFitProperty[] = ['contain', 'cover', 'fill', 'scale-down']
export type AspectRatio = typeof aspectRatios[number]

type Viewport = {
	width:number
	height:number
}
type AppState = {
	showHelp:boolean
	showThumbnails:boolean
	firstLoad:boolean

	fit:ObjectFitProperty
	aspect:AspectRatio

	active?:Display
	dragSrc?:Display

	displays:Display[]
	errorDisplays:Display[]

	viewport?:Viewport
}

const getDisplayCopy = (display:Display) => ({
	...display,
	id: uuid(),
	startTime: display.video ? (display.video.currentTime + 60) % display.video.duration : 0
})

const getNext = <T,>(list:T[], current:T) =>
	list[(list.indexOf(current) + 1) % list.length]

const removeItem = <T,>(list:T[], target:T) => {
	const i = list.indexOf(target)
	return [...list.slice(0,i), ...list.slice(i+1)]
}

export const AppAPI = ({state, setState}:ApiFactoryProps<AppState>) => {
	const setPartialState = (partial:Partial<AppState>) => {
		setState(prev => ({
			...prev,
			...partial
		}))
	}
	const toggleHelp = () => {
		setState(prev => ({
			...prev,
			showHelp: !prev.showHelp
		}))
	}

	const toggleThumbnails = () => {
		setState(prev => ({
			...prev,
			showThumbnails: !prev.showThumbnails
		}))
	}

	const nextAspect = () => {
		setState(prev => ({
			...prev,
			aspect: getNext(aspectRatios, prev.aspect)
		}))
	}

	const nextFit = () => {
		setState(prev => ({
			...prev,
			fit: getNext([...objectFits], prev.fit)
		}))
	}

	const setViewport = (viewport:Viewport) => {
		setState(prev => ({
			...prev,
			viewport
		}))
	}

	const setExclusive = (display:Display) => {
		setState(prev => {
			return {
				...prev,
				activeIndex: 0,
				displays: [display]
			}
		})
	}

	const removeActive = () => {
		setState(prev => {
			if (prev.active === undefined) return prev
			return {
				...prev,
				displays: removeItem(prev.displays, prev.active),
				active: undefined
			}
		})
	}

	const reorderDisplays = (destVideo:EventTarget) => {
		setState(prev => {
			const src = prev.dragSrc
			if (src === undefined) return prev
			const displays = prev.displays
			const si = displays.indexOf(src)
			const di = displays.findIndex(i => i.video === destVideo) || displays.length - 1
			const newDisplays = si > di ? [
				...displays.slice(0, di),
				displays[si],
				...displays.slice(di, si),
				...displays.slice(si+1)
			] : [
				...displays.slice(0, si),
				...displays.slice(si+1, di+1),
				displays[si],
				...displays.slice(di+1)
			]
			return {
				...prev,
				displays: newDisplays
			}
		})
	}

	const copyDisplay = (display:Display) => {
		setState(prev => {
			return {
				...prev,
				displays: [...prev.displays, getDisplayCopy(display)]
			}
		})
	}

	const addCopies = (copies:number) => {
		setState(prev => {
			const active = prev.active
			if (active === undefined) return prev
			return {
				...prev,
				displays: [...prev.displays, ...[...Array(copies)].map(()=>getDisplayCopy(active))]
			}
		})
	}

	const updateDisplay = (display:Display, updates:Partial<Display>) => {
		setState(prev => {
			const displays = [...prev.displays]
			const i = displays.indexOf(display)
			// shallow effect only!
			displays[i] = {...displays[i], ...updates}
			return {
				...prev,
				displays
			}
		})
	}

	const applyToActive = (modifier:(display:Display)=>Partial<Display>) => {
		setState(prev => {
			const active = prev.active
			if (active === undefined) return prev
			const i = prev.displays.indexOf(active)
			return {
				...prev,
				displays: [
					...prev.displays.slice(0, i),
					{...active, ...modifier(active)},
					...prev.displays.slice(i+1)
				]
			}
		})
	}

	const applyToAll = (modifier:(display:Display)=>Partial<Display>) => {
		setState(prev => {
			const displays = prev.displays.map(i=>({...i, ...modifier(i)}))
			return {
				...prev,
				...displays
			}
		})
	}

	const setActiveIO = (marker:'in'|'out') => {
		applyToActive(d => ({[marker]: d.video!.currentTime}))
	}

	const adjustActivePlaybackRate = (adjustment:number) => {
		applyToActive(d=>({playbackRate: d.playbackRate * adjustment}))
	}

	const syncPlaybackRates = (playbackRate:number) => {
		applyToAll(d=>({playbackRate}))
	}

	const addFiles = (files:File[]) => {
		setState(prev => {
			const newDisplays = files.map(file => ({
				id: uuid(),
				file,
				url: URL.createObjectURL(file),
				triggerResize: prev.firstLoad,
				playbackRate: 1
			}))
			return ({
				...prev,
				firstLoad: false,
				showHelp: prev.showHelp && newDisplays.length === 0,
				displays: [...prev.displays, ...newDisplays]
			})
		})
	}

	const handleDisplayError = () => {
		setState(prev => {
			const active = prev.active
			if (active === undefined) return prev
			return {
				...prev,
				displays: removeItem(prev.displays, active),
				errorDisplays: [...prev.errorDisplays, active]
			}
		})
	}

	const dismissErrors = () => {
		setState(prev => ({
			...prev,
			errorDisplays: []
		}))
	}


	const distributeTimes = (sourceDisplay:Display) => {
		const sourceVideo = sourceDisplay.video
		if (!sourceVideo) return
		const sourceFile = sourceDisplay.file

		setState(prev => {
			const matchingDisplays = prev.displays.filter(i => i.file === sourceFile)
			const di = matchingDisplays.indexOf(sourceDisplay)
			// start with target display so it keeps its current time, bump up from there looping back to start
			const orderedDisplays = [sourceDisplay, ...matchingDisplays.slice(di+1), ...matchingDisplays.slice(0, di)]

			const t1 = sourceVideo.currentTime
			const duration = sourceVideo.duration
			const spacing = duration / orderedDisplays.length
			orderedDisplays.forEach((v, i) => {
				const targetTime = t1 + (spacing * i)
				// loop time back to beginning once we exceed end of video
				v.video!.currentTime = targetTime % duration
			})
			return prev
		})
	}

	return {
		...state,
		setPartialState,
		toggleHelp, toggleThumbnails,
		nextAspect,
		nextFit,
		setViewport,
		setExclusive,
		removeActive,
		copyDisplay, addCopies,

		updateDisplay,
		applyToActive, applyToAll,

		setActiveIO, adjustActivePlaybackRate,
		syncPlaybackRates,

		addFiles,
		handleDisplayError, dismissErrors,

		distributeTimes,

		reorderDisplays
	}
}