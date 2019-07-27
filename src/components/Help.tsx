import React from 'react'
import './Help.css'
import { ObjectFitProperty } from "csstype"
import {objectFits} from '../App'
import AspectRatios from '../AspectRatios.json'
type AspectRatio = typeof AspectRatios[number]

const SHORTCUTS = <section id="shortcuts">
	<h2>Shortcuts</h2><ol>
		<li><em>C:</em> Clone video (+1m)</li>
		<li><em>D:</em> Distribute times</li>
		<li><em>E:</em> Remove everything else</li>
		<li><em>F:</em> Toggle fullscreen</li>
		<li><em>Shift+F:</em> Fullscreen video</li>
		<li><em>H:</em> Toggle help</li>
		<li><em>I:</em> Toggle in point</li>
		<li><em>O:</em> Toggle out point</li>
		<li><em>M:</em> Toggle mute</li>
		<li><em>R:</em> Remove video</li>
		<li><em>S:</em> Change video scaling</li>
		<li><em>X:</em> Change aspect ratio</li>
		<li><em>← →:</em> Skip 1m</li>
		<li><em>Shift ← →:</em> Skip 10%</li>
		<li><em>Ctrl ← →:</em> Change speed</li>
		<li><em>Shift+S</em> Sync speeds</li>
		<li><em>Ctrl+W:</em> Close tab</li>
		<li><em>O,O:</em> Restart video</li>
		<li><em>2-9:</em> Fill 2-9 size grid</li>
		<li><em>Drag+Drop:</em> Reorder videos</li>
	</ol>
</section>

const DISCLAIMER = <footer>
	<h2>Privacy Disclaimer</h2>
	<p>This tool records <b>no</b> filenames, screen grabs, or any other methods of identifying the actual contents of any video.  Only metadata about a video's format (codec, file size, resolution, and duration) may be recorded.</p>
</footer>

type HelpSettingsProps = {
	objectFit:ObjectFitProperty
	objectFitCallback:(i:number)=>void
	aspectRatio:AspectRatio
	aspectRatioCallback:(i:number)=>void
}

// const getAR = (v:AspectRatio) => `${v.ratio.toFixed(2)} / ${v.name}`

export function Help(props:HelpSettingsProps) {
	return <section id="help">
		<h2>Usage</h2>
		<p>Drag and drop any number of videos to auto-play in an optimally arranged grid.</p>
		<section id="settings">
			<h2>Settings</h2>
			<form>
				<SelectInput
					name="objectScale" label="Video Fit/Fill"
					value={props.objectFit} choices={objectFits.map((v, i) => <option key={i} value={i}>{v[0].toUpperCase()+v.substr(1)}</option>)}
					callback={i=>props.objectFitCallback(parseInt(i))} /><br />
				<SelectInput
					name="aspectRatio" label="Aspect Ratio"
					value={AspectRatios.indexOf(props.aspectRatio).toString()}
					choices={AspectRatios.map((v, i) => <option key={i} value={i}>{v.name}</option>)}
					callback={i=>props.aspectRatioCallback(parseInt(i))} /><br />
			</form>
		</section>
		{SHORTCUTS}
		{DISCLAIMER}
	</section>
}

function SelectInput(props:{name:string, label:string, value:string, choices:JSX.Element[], callback:(val:string)=>void}) {
	return <>
		<label htmlFor={props.name}>{props.label}</label>
		<select name={props.name} value={props.value} onChange={e => props.callback(e.target.value)}>
			{props.choices}
		</select>
	</>
}

// type NumInputProps = {
// 	value:number
// 	name:string
// 	label:string
// 	callback:(num:number)=>void
// }
// const NumInput = ({value,name,label,callback}:NumInputProps) => <>
// 	<label htmlFor={name}>{label}</label>
// 	<input type="number" min={0} maxLength={3} name={name} value={value} onChange={e => callback(parseFloat(e.target.value))} />
// </>

export default Help