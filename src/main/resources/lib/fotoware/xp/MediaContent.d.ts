import type {OneOrMore} from '@enonic/js-utils/src/types';
import type {Content} from '/lib/xp/content'; // '@enonic-types/core'


export type MediaContent = Content<{
	artist?: OneOrMore<string>
	copyright?: string
	fotoWare: { // Custom requireValid must be false
		metadata?: { // Not the same as Asset['metadata']
			80?: OneOrMore<string>
		}
		md5sum?: string
	}
	media: {
		attachment: string
	}
	tags?: OneOrMore<string>
},'media:image'/*,{}*/>
