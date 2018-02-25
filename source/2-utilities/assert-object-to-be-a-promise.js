module.exports = function isAPromiseObject(input) {
	return !!input && typeof input.then === 'function' && typeof input.done === 'function';
};