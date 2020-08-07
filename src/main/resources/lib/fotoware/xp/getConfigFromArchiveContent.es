//import {toStr} from '/lib/util';
import {
	get as getContent
} from '/lib/xp/content';

export const getConfigFromArchiveContent = ({
	archiveContentId,
	archiveContent = getContent({key: archiveContentId })
}) => {
	const {
		docTypesOptionSet: {
			_selected: selectedDocTypes = ['graphic', 'image'],
			document: {
				pdf = false
			} = {},
			generic: {
				cof = false,
				cop = false,
				cos = false,
				cot = false,
				zip = false
			} = {},
			graphic: {
				ai = false,
				svg = true
			} = {},
			image: {
				cr2 = false,
				jpg = true,
				png = true,
				psd = false,
				tif = false
			} = {},
			movie: {
				mp4 = false
			} = {}
		} = {}
	} = archiveContent.data;

	const selectedExtensions = [];
	if (pdf) { selectedExtensions.push('pdf'); }
	if (cof) { selectedExtensions.push('cof'); }
	if (cop) { selectedExtensions.push('cop'); }
	if (cos) { selectedExtensions.push('cos'); }
	if (cot) { selectedExtensions.push('cot'); }
	if (zip) { selectedExtensions.push('zip'); }
	if (ai) { selectedExtensions.push('ai'); }
	if (svg) { selectedExtensions.push('svg'); }
	if (cr2) { selectedExtensions.push('cr2'); }
	if (jpg) { selectedExtensions.push('jpg'); }
	if (png) { selectedExtensions.push('png'); }
	if (psd) { selectedExtensions.push('psd'); }
	if (tif) { selectedExtensions.push('tif'); }
	if (mp4) { selectedExtensions.push('mp4'); }
	//log.info(`selectedDocTypes:${toStr(selectedDocTypes)}`);
	//log.info(`selectedExtensions:${toStr(selectedExtensions)}`);
	return {
		selectedDocTypes,
		selectedExtensions
	};
}; // getConfigFromArchiveContent
