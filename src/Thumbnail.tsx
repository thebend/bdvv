import React from 'react'
const thumbnailWidth = 196

type ThumbnailProps = {
	src:string
	offset:number
	timestamp:number
	width?:number
}

export const Thumbnail = ({src, offset, timestamp, width=thumbnailWidth}:ThumbnailProps) => {
	const video = React.useRef<HTMLVideoElement>(null)
	if (video.current) video.current.currentTime = timestamp

	return <video className="thumbnail"
		ref={video}
		controls={false} autoPlay={false} loop={false} muted={true}
		src={src} width={width} style={{left: offset - (width / 2)}} />
}
