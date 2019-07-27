import React from 'react'
import {Display} from '../BDVideo'

type ErrorDisplayProps = {
	errorDisplays:Display[]
	dismissCallback:()=>void
}
export function ErrorDisplay({errorDisplays, dismissCallback}:ErrorDisplayProps) {
	return <section id="errors">
		<h2>Errors</h2><ol>
			{errorDisplays.map((display, i) => <li key={i}>{display.file.name} ({display.file.type})</li>)}
		</ol>
		<p>Only videos supported by your web browser will play successfully.  <code>.mp4</code> and <code>.webm</code> files are good bets.</p>
		<form onSubmit={dismissCallback}><button>Dismiss</button></form>
	</section>
}
