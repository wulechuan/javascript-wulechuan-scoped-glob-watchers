module.exports = function getValidStringFrom(stringToCheck, shouldTrim = true) {
	const isValid = typeof stringToCheck === 'string' && !!stringToCheck;
	if (isValid) {
		return shouldTrim ? stringToCheck.trim() : stringToCheck;
	}
	return '';
};
