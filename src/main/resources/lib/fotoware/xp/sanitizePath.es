import {sanitize} from '/lib/xp/common';

export const sanitizePath = (pathStr) => pathStr.split('/').map((p) => sanitize(p)).join('/');
