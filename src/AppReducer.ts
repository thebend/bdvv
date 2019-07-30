import uuid from 'uuid'
import {ObjectFitProperty} from 'csstype'
import { Display } from './BDVideo'
import { toggleFullscreen } from './FullScreen'
import aspectRatios from './AspectRatios.json'

export const objectFits:ObjectFitProperty[] = ['contain', 'cover', 'fill', 'scale-down']
export type AspectRatio = typeof aspectRatios[number]

const getDisplayCopy = (display:Display) => ({
	...display,
	id: uuid(),
	startTime: display.video ? (display.video.currentTime + 60) % display.video.duration : 0
})

const getNext = <T,>(list:T[], current:T) =>
	list[(list.indexOf(current) + 1) % list.length]

const removeIndex = <T,>(list:T[], i:number) =>
	[...list.slice(0,i), ...list.slice(i+1)]

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

	activeIndex?:number
	dragSrc?:Display

	displays:Display[]
	errorDisplays:Display[]

	viewport?:Viewport
}

export type AppAction =
| { type: 'nextAspect' }
| { type: 'nextFit' }
| { type: 'setExclusive', payload:number }
| { type: 'toggleHelp' }
| { type: 'toggleThumbnails' }
| { type: 'toggleFullscreen' }
| { type: 'setPartialState', payload:Partial<AppState> }
| { type: 'removeActive' }
| { type: 'copyDisplay', payload:number }
| { type: 'reorderDisplays', payload:EventTarget }
| { type: 'addCopies', payload:number }
| { type: 'updateDisplay', payload: {index:number, updates:Partial<Display>} }
| { type: 'applyToActive', payload:(display:Display)=>Partial<Display> }
| { type: 'applyToAll', payload:(display:Display)=>Partial<Display> }
| { type: 'addFiles', payload:File[] }
| { type: 'handleDisplayError', payload:number }
| { type: 'dismissErrors' }
| { type: 'distributeTimes' }
| { type: 'setActiveIO', payload:'in'|'out' }
| { type: 'adjustActivePlaybackRate', payload:number }
| { type: 'syncPlaybackRates', payload:number }

export const AppReducer = (state:AppState, action:AppAction):AppState => {
	const applyToActive = (modifier:(display:Display)=>Partial<Display>) => {
		const i = state.activeIndex
		if (i === undefined) return state
		const d = state.displays
		const displays = [
			...d.slice(0, i),
			{...d[i], ...modifier(d[i])},
			...d.slice(i+1)
		]
		return { ...state, displays }
	}

	const applyToAll = (modifier:(display:Display)=>Partial<Display>) => {
		const displays = state.displays.map(i=>({...i, ...modifier(i)}))
		return { ...state, ...displays}
	}

switch (action.type) {
	case 'nextAspect':
		return {...state, aspect: getNext(aspectRatios, state.aspect)}
	case 'nextFit':
		return {...state, fit: getNext(objectFits, state.fit)}
	case 'setExclusive':
		return {...state, activeIndex: 0, displays: [state.displays[action.payload]]}
	case 'toggleHelp':
		return {...state, showHelp: !state.showHelp}
	case 'toggleThumbnails':
		return {...state, showThumbnails: !state.showThumbnails}
	case 'setPartialState':
		return {...state, ...action.payload}
	case 'toggleFullscreen':
		toggleFullscreen()
		return state
	case 'removeActive':
		if (state.activeIndex === undefined) return state
		return {...state, displays: removeIndex(state.displays, state.activeIndex)}
	case 'copyDisplay': {
		const displays = [
			...state.displays,
			getDisplayCopy(state.displays[action.payload])
		]
		return { ...state, displays }
	}
	case 'reorderDisplays': {
		const src = state.dragSrc
		if (src === undefined) return state
		const d = state.displays
		const si = d.indexOf(src)
		const di = d.findIndex(i => i.video === action.payload) || d.length - 1
		const displays = si > di ? [
			...d.slice(0, di),
			d[si],
			...d.slice(di, si),
			...d.slice(si+1)
		] : [
			...d.slice(0, si),
			...d.slice(si+1, di+1),
			d[si],
			...d.slice(di+1)
		]
		return { ...state, displays }
	}
	case 'addCopies': {
		const i = state.activeIndex
		if (i === undefined) return state
		const displays = [
			...state.displays,
			...[...Array(action.payload)].map(()=>getDisplayCopy(state.displays[i]))
		]
		return { ...state, displays }
	}
	case 'updateDisplay': {
		const displays = [...state.displays]
		const {index, updates} = action.payload
		displays[index] = { ...displays[index], ...updates }
		return { ...state, displays }
	}
	// lots of issues because active is an object, not the object in question
	case 'applyToActive':
		return applyToActive(action.payload)
	case 'applyToAll':
		return applyToAll(action.payload)
	case 'setActiveIO': {
		const marker = action.payload
		return applyToActive(display => ({
			[marker]: display[marker] === undefined
				? display.video!.currentTime
				: undefined
		}))
	}
	case 'addFiles': {
		const newDisplays = action.payload.map(file => ({
			id: uuid(),
			file,
			url: URL.createObjectURL(file),
			// triggerResize: state.firstLoad,
			playbackRate: 1
		}))
		return {
			...state,
			firstLoad: false,
			showHelp: state.showHelp && newDisplays.length === 0,
			displays: [...state.displays, ...newDisplays]
		}
	}
	case 'handleDisplayError': {
		const i = action.payload
		return {
			...state,
			errorDisplays: [...state.errorDisplays, state.displays[i]],
			displays: removeIndex(state.displays, i)
		}
	}
	case 'dismissErrors':
		return { ...state, errorDisplays: [] }
	case 'distributeTimes': {
		const i = state.activeIndex
		if (i === undefined) return state
		const display = state.displays[i]
		const {video, file} = display
		if (!video) return state

		const matchingDisplays = state.displays.filter(i => i.file === file)
		// start with target display so it keeps its current time, bump up from there looping back to start
		const orderedDisplays = [
			display,
			...matchingDisplays.slice(i+1),
			...matchingDisplays.slice(0, i)
		]

		const t1 = video.currentTime
		const duration = video.duration
		const spacing = duration / orderedDisplays.length

		orderedDisplays.forEach((v, i) => {
			const targetTime = t1 + (spacing * i)
			// loop time back to beginning once we exceed end of video
			v.video!.currentTime = targetTime % duration
		})
		return state
	}
	case 'adjustActivePlaybackRate':
		return applyToActive(
			d=>({playbackRate: d.playbackRate * action.payload}))
	case 'syncPlaybackRates':
		return applyToAll(d=>({playbackRate: action.payload}))
}}