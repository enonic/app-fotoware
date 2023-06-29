import type { Content } from '/lib/xp/content';
import type { PageComponent } from '@enonic-types/core';


export type MediaContent = Content<{
	altText?: string
	artist?: string|string[]
	caption?: string
	copyright?: string
	fotoWare?: { // Custom requireValid must be false
		metadata?: Record<PropertyKey,string|string[]>
		// metadata?: { // Not the same as Asset['metadata']
		// 	5?: OneOrMore<string>
		// 	25?: OneOrMore<string>
		// 	80?: OneOrMore<string>
		// 	116?: OneOrMore<string>
		// 	120?: OneOrMore<string>
		// }
		md5sum?: string
	}
	media: {
		attachment: string
		focalPoint?: {
			x: number
			y: number
		}
	}
	tags?: string|string[]
},
	'media:image'|'media:unknown',
	PageComponent
>
