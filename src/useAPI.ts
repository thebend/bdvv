import {useState, useMemo} from 'react'

export type ApiFactoryProps<T> = {
	state:T,
	setState:(callback:(prevState:T)=>T)=>void
}

export const useAPI = <T,V>(apiFactory:(props:ApiFactoryProps<T>)=>V, initialState:T) => {
	let [state, setState] = useState(initialState)
	return useMemo(
		()=>apiFactory({ state, setState }),
		[state, apiFactory]
	)
}

