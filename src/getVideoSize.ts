export function getVideoSize(aspectRatio:number, objects:number, constraints:{width:number,height:number}) {
	// try every number of rows up to a dedicated row for each video
	let bestArea = 0, width = 0, height = 0
	for (let rows = 1; rows <= objects; rows++) {
		// get the necessary number of columns with a given number of rows
		const cols = Math.ceil(objects / rows)
		// this determines the size of the resulting box
		const x = Math.floor(constraints.width / cols)
		const y = Math.floor(constraints.height / rows)
		// actual video dimensions will depend on ratio within the display box, being shrunk on one side
		let vx = x, vy = y
		if (aspectRatio > x/y) {
			vy = vx / aspectRatio
		} else {
			vx = vy * aspectRatio
		}
		const videoArea = vx * vy
		// if this isn't an improvement, continue looking
		if (videoArea < bestArea) continue
		// otherwise save this as best situation
		bestArea = videoArea
		width = x
		height = y
	}

	return {width, height}
}
