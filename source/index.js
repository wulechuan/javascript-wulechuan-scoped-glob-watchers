const LazyWatcherClass = require('./0-core/the-watcher-class');
const createWatchersAccordingTo = require('./0-core/method-for-creating-a-batch-of-watcher-instances');



const factoryForConnectorOfGaze = require('./1-connectors-to-underlying-file-watch-engines/connector-to-gaze');
LazyWatcherClass.registerConnectorForOneUnderlyingWatchEngine('gaze', factoryForConnectorOfGaze);



module.exports = {
	createWatchersAccordingTo,
	LazyWatcher: LazyWatcherClass,
};