const gaze = require('gaze');

const toNormalizeOneGlobPathIntoRelativePath = require('../2-utilities/normalize-glob-paths');

const alignedEventTypeOfEventRawType = {
	'added':   'Added',
	'deleted': 'Disappeared',
	'renamed': 'Renamed',
	'changed': 'Modified',
};




module.exports = function toCreateOneConnectorForTheGazeEngine(options = {}) {
	const {
		watchingBasePath = process.cwd(),
		basePathForShorteningPathsInLog = watchingBasePath,
	} = options;

	return {
		listenToEvents,
		removeAllListeners,
		toNormalizeOneGlob,
		toGetPrintVersionOfOneGlob,
		alignedEventTypeOfEventRawType,
	};



	function toNormalizeOneGlob(rawGlob) {
		return toNormalizeOneGlobPathIntoRelativePath(watchingBasePath, rawGlob);
	}

	function toGetPrintVersionOfOneGlob(rawGlob) {
		return toNormalizeOneGlobPathIntoRelativePath(basePathForShorteningPathsInLog, rawGlob);
	}
};




function listenToEvents(watchingBasePath, globsToWatch, events) {
	const {
		abstractListenerCandidateFor,
		usedAbstractListenerFor,
	} = events;

	const defaultSingleFileInvolvedListener = abstractListenerCandidateFor['the "all" event'];

	if (! usedAbstractListenerFor['gaze:all']) {
		usedAbstractListenerFor['gaze:all'] = defaultSingleFileInvolvedListener;
	}

	// if (!usedAbstractListenerFor['gaze:added']) {
	// 	usedAbstractListenerFor['gaze:added'] = (involvedFileAbsolutePath) => {
	// 		defaultSingleFileInvolvedListener('added', involvedFileAbsolutePath);
	// 	};
	// }

	// if (!usedAbstractListenerFor['gaze:renamed']) {
	// 	usedAbstractListenerFor['gaze:renamed'] = (involvedFileAbsolutePath) => {
	// 		defaultSingleFileInvolvedListener('renamed', involvedFileAbsolutePath);
	// 	};
	// }

	// if (!usedAbstractListenerFor['gaze:changed']) {
	// 	usedAbstractListenerFor['gaze:changed'] = (involvedFileAbsolutePath) => {
	// 		defaultSingleFileInvolvedListener('changed', involvedFileAbsolutePath);
	// 	};
	// }

	// if (!usedAbstractListenerFor['gaze:deleted']) {
	// 	usedAbstractListenerFor['gaze:deleted'] = (involvedFileAbsolutePath) => {
	// 		defaultSingleFileInvolvedListener('deleted', involvedFileAbsolutePath);
	// 	};
	// }

	gaze(
		globsToWatch,

		{
			cwd: watchingBasePath,
		},

		(error, thisGazer) => {
			events.emitterOf['gaze'] = thisGazer; // eslint-disable-line dot-notation

			thisGazer.on('all', usedAbstractListenerFor['gaze:all']);

			// 不论是直接侦听 all 事件，还是分别侦听以下四种事件，都无法避免将 rename 误判为两个不同事件。
			// 多数情况下是误判为文件先被 deleted 再被 renamed ；偶尔会出现先 deleted 后 added 。
			// 因此，干脆仍然采用侦听 all 事件。
			// thisGazer.on('added', usedAbstractListenerFor['gaze:added']);
			// thisGazer.on('renamed', usedAbstractListenerFor['gaze:renamed']);
			// thisGazer.on('changed', usedAbstractListenerFor['gaze:changed']);
			// thisGazer.on('deleted', usedAbstractListenerFor['gaze:deleted']);
		}
	);
}

function removeAllListeners(events) {
	const gazer = events.emitterOf['gaze']; // eslint-disable-line dot-notation
	const eventListeners = events.usedAbstractListenerFor;
	gazer.removeListener('all', eventListeners['gaze:all']);
	// gazer.removeListener('added', eventListeners['gaze:added']);
	// gazer.removeListener('renamed', eventListeners['gaze:renamed']);
	// gazer.removeListener('changed', eventListeners['gaze:changed']);
	// gazer.removeListener('deleted', eventListeners['gaze:deleted']);
}
