const pathTool = require('path');

module.exports = function toNormalizeOneGlobPathIntoRelativePath(basePath, rawGlob) {
	if (basePath && typeof basePath !== 'string') {
		throw TypeError('The basePath must be either a null or a string.');
	}

	if (typeof rawGlob !== 'string') {
		throw TypeError('A glob must be a string.');
	}

	if (! rawGlob && ! basePath) {
		return '';
	}

	if (! basePath) {
		basePath = '';
	} else {
		basePath = basePath.trim();
	}

	// 一些文件监测引擎，例如 gaze ，不支持Windows路径。
	// 而且起码在Windows下不能侦听绝对路径（以“/”开头的路径）的变动。
	let normalizedGlob = rawGlob.trim();

	const hasNegativeSign = normalizedGlob.slice(0, 1) === '!';

	if (hasNegativeSign) {
		normalizedGlob = normalizedGlob.slice(1);
	}

	normalizedGlob = pathTool.relative(basePath, normalizedGlob)
		.replace(/\\/g, '/'); // gaze似乎不支持Windows路径

	if (hasNegativeSign) {
		normalizedGlob = `!${normalizedGlob}`;
	}

	return normalizedGlob;
};
