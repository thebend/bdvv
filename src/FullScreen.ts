export function fullscreenElement(element:HTMLElement) {
	(element.requestFullscreen || (element as any).msRequestFullscreen || (element as any).webkitRequestFullscreen).call(element)
}

const fsEnabled = document.fullscreenEnabled || (document as any).msFullscreenEnabled || (document as any).webkitFullscreenEnabled
const fsExit = (document.exitFullscreen || (document as any).msExitFullscreen || (document as any).webkitExitFullscreen).bind(document)
export function toggleFullscreen(target:HTMLElement = document.body) {
	if (!fsEnabled) return
	const fsElement = document.fullscreenElement || (document as any).msFullscreenElement || (document as any).webkitFullscreenElement
	if (fsElement) {
		fsExit()
	} else {
		fullscreenElement(target)
	}
}
