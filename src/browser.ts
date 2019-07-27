function getBrowser() {
	if (navigator.userAgent.indexOf(' Trident/') > -1) return 'IE'
	if (navigator.userAgent.indexOf(' Edge/') > -1) return 'Edge'
	return 'Chrome'
}

const videoMargins = {
	"edge": {
		"left": 116,
		"right": 220,
		"bottom": 24
	},
	"chrome": {
		"left": 24,
		"right": 24,
		"bottom": 16
	}
}


export const browser = getBrowser()
export const msBrowser = ["Edge","IE"].indexOf(browser) > -1
export const margins = videoMargins[browser === "Chrome" ? 'chrome' : 'edge']