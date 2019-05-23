import React from 'react'

export const HELP = <section id="help">
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
		<li><em>Shift+F:</em> Fullscreen video</li>
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

export default HELP