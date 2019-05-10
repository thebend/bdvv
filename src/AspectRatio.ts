export interface AspectRatio {
	ratio:number,
	name:string
}

export const ASPECT_RATIOS = [
	{
		ratio: 16/9,
		name: "16:9 (High Definition)"
	}, {
		ratio: 4/3,
		name: "4:3 (Standard Definition)"
	}, {
		ratio: 1,
		name: "1:1 (Square)",
	}, {
		ratio: 9/16,
		name: "9:16 (Vertical HD)"
	}, {
		ratio: 1.85,
		name: "1.85:1 (Cinematic Wide)"
	}, {
		ratio: 2.35,
		name: "2.35:1 (Anamorphic Wide)"
	}
]