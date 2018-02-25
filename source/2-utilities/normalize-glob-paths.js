const pathTool = require('path');

module.exports = function toNormalizeOneGlobPathIntoRelativePath(basePath, rawGlob) {
	// 一些文件监测引擎，例如 gaze ，不支持Windows路径。
	// 而且起码在Windows下不能侦听绝对路径（以“/”开头的路径）的变动。
	let normalizedGlob = rawGlob.trim();

	const hasNegativeSign = normalizedGlob.slice(0, 1) === '!';

	if (hasNegativeSign) {
		normalizedGlob = normalizedGlob.slice(1);
	}

	normalizedGlob = pathTool.relative(basePath, normalizedGlob).replace(/\\/g, '/');

	if (hasNegativeSign) {
		normalizedGlob = `!${normalizedGlob}`;
	}

	return normalizedGlob;
};
