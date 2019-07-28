import {ApiFactoryProps} from './useAPI'

type BDVideoState = {

}

export const BDVideoAPI = ({state, setState}:ApiFactoryProps<BDVideoState>) => {
	const setPartialState = (partial:Partial<BDVideoState>) => {
		setState(prev => ({
			...prev,
			...partial
		}))
	}
	return {
		...state,
		setPartialState
	}
}