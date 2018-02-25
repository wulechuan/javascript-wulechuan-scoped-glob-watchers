const LazyWatcherClass = require('./the-watcher-class');

module.exports = function createWatchersAccordingTo(scopedWatchingSettings, sharedOptions = {
	// underlyingWatchEngineIdToUse,
	// engineId,           // also allowed to set in each scoped settings
	// basePath,           // also allowed to set in each scoped settings
	// shouldLogVerbosely, // also allowed to set in each scoped settings
}) {
	const decidedShareOptions = Object.assign(
		{
			underlyingWatchEngineIdToUse: LazyWatcherClass.defaultConfiguration.underlyingWatchEngineId,
			basePath:                     process.cwd(),
			shouldLogVerbosely:           false,
		},

		sharedOptions
	);

	const knownScopeIds = Object.keys(scopedWatchingSettings);

	const watcherInstances = knownScopeIds.reduce((watcherInstances, scopeId) => {
		if (watcherInstances[scopeId]) {
			throw Error(`Duplicated scope id "${scopeId}".`);
		}

		const lazyWatcherConstructionOptions = Object.assign(
			{},
			decidedShareOptions,
			scopedWatchingSettings[scopeId]
		);

		// console.log(lazyWatcherConstructionOptions);

		watcherInstances[scopeId] = new LazyWatcherClass(scopeId, lazyWatcherConstructionOptions);

		return watcherInstances;
	}, {});


	return watcherInstances;
};