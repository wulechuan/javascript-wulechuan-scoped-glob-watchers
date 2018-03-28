const LazyWatcherClass = require('./the-watcher-class');

module.exports = function createWatchersAccordingTo(scopedWatchingSettings, sharedOptions = {
	// underlyingWatchEngineIdToUse,    // also allowed to set in each scoped settings
	// watchingBasePath,                // also allowed to set in each scoped settings
	// basePathForShorteningPathsInLog, // also allowed to set in each scoped settings
	// shouldLogVerbosely,              // also allowed to set in each scoped settings
}) {
	const usedSharingOptions = Object.assign(
		{
			underlyingWatchEngineIdToUse: LazyWatcherClass.defaultConfiguration.underlyingWatchEngineId,
		},

		sharedOptions
	);

	const knownScopeIds = Object.keys(scopedWatchingSettings);

	const watcherInstances = knownScopeIds.reduce((watcherInstances, scopeId) => {
		if (watcherInstances[scopeId]) {
			throw Error(`Duplicated scope id "${scopeId}".`);
		}

		const scopeSpecificOptions = scopedWatchingSettings[scopeId];

		const lazyWatcherConstructionOptions = Object.assign({}, usedSharingOptions, scopeSpecificOptions);

		watcherInstances[scopeId] = new LazyWatcherClass(scopeId, lazyWatcherConstructionOptions);

		return watcherInstances;
	}, {});


	return watcherInstances;
};