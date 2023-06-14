import { Journal } from './Journal';


export interface TaskNodeData {
	data: {
		importName: string
		journal?: Journal
		shouldStop: boolean
		site: string
	}
}
