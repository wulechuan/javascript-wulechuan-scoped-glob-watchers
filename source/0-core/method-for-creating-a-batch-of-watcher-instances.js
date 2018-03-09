const LazyWatcherClass = require('./the-watcher-class');

module.exports = function createWatchersAccordingTo(scopedWatchingSettings, sharedOptions = {
	// underlyingWatchEngineIdToUse,
	// watchingBasePath,                 // also allowed to set in each scoped settings
	// basePathForShorteningPathsInLog,  // also allowed to set in each scoped settings
	// shouldLogVerbosely,               // also allowed to set in each scoped settings
}) {
	const defaultSharingOptions = {
		underlyingWatchEngineIdToUse:    LazyWatcherClass.defaultConfiguration.underlyingWatchEngineId,
		watchingBasePath:                process.cwd(),
		basePathForShorteningPathsInLog: process.cwd(),
		shouldLogVerbosely:              false,
	};

	const decidedSharingOptions = {
		...defaultSharingOptions,
		...sharedOptions,
	};

	const knownScopeIds = Object.keys(scopedWatchingSettings);

	const watcherInstances = knownScopeIds.reduce((watcherInstances, scopeId) => {
		if (watcherInstances[scopeId]) {
			throw Error(`Duplicated scope id "${scopeId}".`);
		}

		const scopeSpecificOptions = scopedWatchingSettings[scopeId];

		const lazyWatcherConstructionOptions = {
			...decidedSharingOptions,
			...scopeSpecificOptions,
		};

		watcherInstances[scopeId] = new LazyWatcherClass(scopeId, lazyWatcherConstructionOptions);

		return watcherInstances;
	}, {});


	return watcherInstances;
};