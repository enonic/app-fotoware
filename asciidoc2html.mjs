import {
	mkdirSync,
	readFileSync,
	writeFileSync
} from 'fs';

import asciidoctorCoreLib from '@asciidoctor/core';

const asciidoctor = asciidoctorCoreLib();

const OUTDIR = 'build/resources/main/admin/tools/fotoware/'

mkdirSync(OUTDIR, { recursive: true });

const content = readFileSync('docs/index.adoc').toString();
//console.log(content);

const div = asciidoctor.convert(content) // <2>
//console.log(div);

const css = readFileSync('node_modules/@asciidoctor/core/dist/css/asciidoctor.css').toString();
const html = `<html>
	<head>
		<title>FotoWare App Documentation</title>
		<style>
			${css}
		</style>
	</head>
	<body>${div}</body>
</html>`;

writeFileSync(OUTDIR + 'doc.html', html);
