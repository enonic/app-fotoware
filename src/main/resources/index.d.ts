export type * from './lib/fotoware/index.d';

export interface XpXDataMediaImageInfo {
	byteSize?: number
	contentType?: string
	description?: string
	imageHeight?: number
	imageWidth?: number
	pixelSize?: number
}

export interface XpXDataMedia {
	imageInfo?: XpXDataMediaImageInfo
}

declare global {
	interface XpXData {
		media?: XpXDataMedia
	}
}
