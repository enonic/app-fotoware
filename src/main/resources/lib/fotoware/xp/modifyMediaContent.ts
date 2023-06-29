import type {
	Mappings,
	MediaContent,
	Metadata,
	SiteConfigProperties
} from '/lib/fotoware';
import type { Content } from '/lib/xp/content';


import {toStr} from '@enonic/js-utils';
import is from '@sindresorhus/is';
import {updateMetadataOnContent} from '/lib/fotoware/xp/updateMetadataOnContent';
import {
	delete as deleteContent,
	modify as modifyContent
} from '/lib/xp/content';


// Not certain this is a good idea, but it works
declare global {
	interface Error {
		class: {
			name: string
		}
	}
}


export const modifyMediaContent = ({
	exisitingMediaContent, // is undefined when creating
	key,
	md5sum,
	mappings,
	metadata,
	properties
}: {
	exisitingMediaContent?: Partial<MediaContent>
	key: string
	mappings: Mappings
	md5sum: string
	metadata: Metadata
	properties: SiteConfigProperties
}) => {
	// log.debug(`modifyMediaContent properties:${toStr(properties)}`);
	let modifiedContent: MediaContent;
	try {
		modifiedContent = modifyContent<MediaContent['data'], 'media:image'>({
			key,
			editor: (content) => updateMetadataOnContent({
				content,
				mappings,
				md5sum,
				metadata,
				modify: !!exisitingMediaContent,
				properties
			}) as Content<MediaContent['data'], 'media:image'>,
			requireValid: false // May contain extra undefined x-data
		}) as MediaContent; // modifyContent
	} catch (e: unknown) {
		log.debug('modifyContent catch');
		log.debug(e);
		// if (e instanceof Error) {
		if (is.error(e)) {
			if (e.class.name === 'com.enonic.xp.data.ValueTypeException') {
				// Known problem on psd, svg, ai, jpf, pdf
				log.error(`Unable to modify ${key}`);
				/*deleteContent({ // So it will be retried on next sync
					key: createMediaResult._id
				});*/
				//throw(e);
			} else if (e.class.name === 'java.lang.RuntimeException' && e.message === 'Failed to read BufferedImage from InputStream') {
				// c.e.x.e.impl.BinaryExtractorImpl - Error extracting binary: TIKA-198: Illegal IOException from org.apache.tika.parser.jpeg.JpegParser@44c1fc82
				//java.lang.RuntimeException: Failed to read BufferedImage from InputStream
				log.warning(`Deleting corrupt image ${key}`);
				deleteContent({ // We don't want corrupt files
					key
				});
			} else {
				log.error(`Something unkown went wrong when trying to modifyContent exisitingMediaContent:${toStr(exisitingMediaContent)}`); // exisitingMediaContent can be undefined
				//log.error(`metadataObj:${toStr(metadataObj)}`);
				log.error(e); // com.enonic.xp.data.ValueTypeException: Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
				//log.error(e.class.name); // com.enonic.xp.data.ValueTypeException
				//log.error(e.message); // Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
				deleteContent({ // So it will be retried on next sync
					key
				});
				throw(e); // NOTE Only known way to get stacktrace
			}
		}
		throw(e); // This will never happen :)
	} // catch
	// log.debug('modifyMediaContent modifiedContent:%s', modifiedContent); // wihtout toStr for jest tests
	return modifiedContent;
}
