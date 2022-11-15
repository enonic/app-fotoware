import type {Content} from '/lib/xp/content'; // '@enonic-types/core'


export type MediaContent = Content<{
	fotoWare: { // Custom requireValid must be false
		md5sum? :string
	}
	media: {
		attachment :string
	}
},'media:image'/*,{}*/>
