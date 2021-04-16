import {updateMetadataOnContent} from '/lib/fotoware/xp/updateMetadataOnContent';
import {
	delete as deleteContent,
	modify as modifyContent
} from '/lib/xp/content';
import {toStr} from '/lib/util';

export const modifyMediaContent = ({
	exisitingMediaContent, // is undefined when creating
	key,
	md5sum,
	metadata,
	properties
}) => {
	//log.debug(`modifyMediaContent properties:${toStr(properties)}`);
	try {
		modifyContent({
			key,
			editor: (content) => updateMetadataOnContent({
				content,
				md5sum,
				metadata,
				modify: !!exisitingMediaContent,
				properties
			}),
			requireValid: false // May contain extra undefined x-data
		}); // modifyContent
	} catch (e) {
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
			log.error(`Something unkown went wrong when trying to modifyContent exisitingMediaContent:${toStr(exisitingMediaContent)}`);
			//log.error(`metadataObj:${toStr(metadataObj)}`);
			log.error(e); // com.enonic.xp.data.ValueTypeException: Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
			//log.error(e.class.name); // com.enonic.xp.data.ValueTypeException
			//log.error(e.message); // Value of type [com.enonic.xp.data.PropertySet] cannot be converted to [Reference]
			deleteContent({ // So it will be retried on next sync
				key
			});
			throw(e); // NOTE Only known way to get stacktrace
		}
	} // catch
}
