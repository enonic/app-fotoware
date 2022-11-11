function required(params, name) {
	const value = params[name];
	if (value === undefined) {
		throw 'Parameter \'' + name + '\' is required';
	}

	return value;
}

function nullOrValue(value) {
	if (value === undefined) {
		return null;
	}

	return value;
}

exports.updateMedia = function (params) {
	const bean = __.newBean('com.enonic.app.fotoware.ModifyMediaCommand');
	bean.setKey(required(params, 'key'));
	bean.setName(required(params, 'name'));
	bean.setMimeType(nullOrValue(params.mimeType));

	if (params.focalX) {
		bean.setFocalX(params.focalX);
	}
	if (params.focalY) {
		bean.setFocalY(params.focalY);
	}
	bean.setCaption(nullOrValue(params.caption));
	bean.setArtist(nullOrValue(params.artist));
	bean.setCopyright(nullOrValue(params.copyright));
	bean.setTags(nullOrValue(params.tags));
	bean.setData(nullOrValue(params.data));
	return __.toNativeObject(bean.execute());
};
