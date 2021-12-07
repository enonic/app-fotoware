import {getConfigFromAppCfg} from '/lib/fotoware/xp/getConfigFromAppCfg';


export function get() {
	const {sitesConfigs} = getConfigFromAppCfg();
	return {
		body: sitesConfigs,
		contentType: 'application/json;charset=utf-8'
	};
} // get
