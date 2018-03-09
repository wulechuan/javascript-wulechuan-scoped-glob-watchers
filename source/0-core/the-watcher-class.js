const chalk = require('chalk');
const consoleDoesSupportColors = chalk.supportsColor;

const isAPromiseObject = require('../2-utilities/assert-object-to-be-a-promise');
const getValidStringFrom = require('../2-utilities/get-so-called-valid-string');





const defaultConfiguration = require('../default-configuration');
const registeredFactoriesForConnectorsOfUnderlyingEngines = {};

const TERM_FOR_FILE_ENTERED_SCOPE  = 'Added';
const TERM_FOR_FILE_DISAPPEARED    = 'Disappeared';
const TERM_FOR_FILE_RENAMED        = 'Renamed';
const TERM_FOR_FILE_MODIFIED       = 'Modified';
const TERM_FOR_UNKNOWN_FILE_CHANGE = 'Change of unknown type';







// eslint-disable-next-line max-statements
function LazyWatcherClass(scopeId, constructionOptions) {
	scopeId = getValidStringFrom(scopeId);

	let {
		globsToWatch,
	} = constructionOptions;

	const {
		actionToTake,
	} = constructionOptions;

	if (! scopeId) {
		throw new TypeError(chalk.bgRed.black(` Arguments[${chalk.white(0)}] ("${
			chalk.white('scopeId')}"): Must be a non empty string. `));
	}

	if (! globsToWatch) {
		throw new TypeError(chalk.bgRed.black(` Arguments[${chalk.white(1)}] ("${
			chalk.white('options')
		}"): Must contain a property named "${
			chalk.white('globsToWatch')
		}, and the value must be either a non-empty string or an array of that kind of strings.". `));
	}

	if (! Array.isArray(globsToWatch)) {
		globsToWatch = [globsToWatch];
	}

	if (typeof actionToTake !== 'function') {
		throw new TypeError(chalk.bgRed.black(` Arguments[${chalk.white(1)}] ("${
			chalk.white('options')
		}"): Must contain a ${
			chalk.white('function')
		} property named "${chalk.white('actionToTake')}". `));
	}

	const rawGlobsToWatch = [
		...globsToWatch,
	];




	let isConstructingInstance = true;

	const thisWatcher = this;

	const scopeIdPrintingString = LazyWatcherClass.getPrettyPrintingStringOfScopeId(scopeId);

	const {
		watchingBasePath = process.cwd(),
		basePathForShorteningPathsInLog = watchingBasePath,
		delayTimeForTakingAction = defaultConfiguration.delayTimeInMilliSecondsForGatheringEvents,
		shouldTakeActionOnWatcherCreation = false,
		underlyingWatchEngineIdToUse = '',
		shouldNotConnectToAnyUnderlyingEngineOnConstruction = false,
		shouldLogVerbosely = false,
	} = constructionOptions;

	let {
		shouldStartWithLessLogs = true,
	} = constructionOptions;

	if (shouldLogVerbosely) {
		shouldStartWithLessLogs = false;
	}

	let actionsAreAllowedInTheFuture = false; // 如果为 false ，文件变动仍然会积累，但注册的动作被按下，不激发。


	let somethingChangedAfterLastActionStart = false;
	let knownChangesSoFar = [];
	let actionIsOnGoing = false;
	let lastActionTakenTimestamp = NaN;
	let currentTimerId = null;

	let lastUsedUnderlyingWatchEngineId = '';
	let currentUnderlyingWatchEngineId = '';
	let currentUnderlyingWatchEngineConnector = null;
	let normalizedGlobs = [];
	let printingVersionOfGlobs = [];


	const cachedConnectorsToUsedUnderlyingEngines = {};
	const events = {
		abstractListenerCandidateFor: {
			'the "all" event': rememberAnEvent,
		},
		usedAbstractListenerFor: {},
		emitterOf: {},
	};


	thisWatcher.scopeId = scopeId;
	thisWatcher.watchingBasePath = watchingBasePath;
	thisWatcher.basePathForShorteningPathsInLog = basePathForShorteningPathsInLog;
	thisWatcher.rawGlobsToWatch = globsToWatch; // Protect the copied "rawGlobsToWatch"

	thisWatcher.connectToUnderlyingWatchEngine = connectToUnderlyingWatchEngine.bind(thisWatcher);
	thisWatcher.disconnectCurrentUnderlyingWatchEngine = disconnectCurrentUnderlyingWatchEngine.bind(thisWatcher);
	thisWatcher.allowFutureActions = allowFutureActions.bind(thisWatcher);
	thisWatcher.holdFutureActions = holdFutureActions.bind(thisWatcher);
	thisWatcher.rememberAnEvent = rememberAnEvent.bind(thisWatcher);
	thisWatcher.forceToTakeActionOnce = () => { takeActionOnce(true); };

	thisWatcher.getLastUsedUnderlyingWatchEngineId = () => {
		return lastUsedUnderlyingWatchEngineId;
	};

	thisWatcher.getCurrentUnderlyingWatchEngineId = () => {
		return currentUnderlyingWatchEngineId;
	};

	thisWatcher.getCurrentUnderlyingWatchEngineConnector = () => {
		return currentUnderlyingWatchEngineConnector;
	};

	thisWatcher.getNormalizedGlobs = () => {
		return [].concat(normalizedGlobs);
	};

	thisWatcher.getInvolvedFileRecords = () => {
		return [].concat(knownChangesSoFar);
	};

	thisWatcher.actionIsOnGoing = () => {
		return actionIsOnGoing;
	};

	thisWatcher.actionsAreAllowedInTheFuture = () => {
		return actionsAreAllowedInTheFuture;
	};

	thisWatcher.onUnderlyingWatchEngineConnected = undefined;
	thisWatcher.onUnderlyingWatchEngineDisconnected = undefined;


	init();

	isConstructingInstance = false;









	function init() {
		if (shouldTakeActionOnWatcherCreation) {
			takeActionOnce(true, {
				extraMessage: 'before connecting to any underlying watch engine',
				shouldNotPrintInvolvedFileList: true,
			});
		}

		if (! shouldNotConnectToAnyUnderlyingEngineOnConstruction) {
			connectToUnderlyingWatchEngine(underlyingWatchEngineIdToUse);
		}
	}

	function toNormalizeGlobs(rawGlobs, toNormalizeOneGlob) {
		return rawGlobs.map(toNormalizeOneGlob);
	}

	function toGetPrintVersionOfGlobs(rawGlobs, toGetPrintVersionOfGlobs) {
		return rawGlobs.map(toGetPrintVersionOfGlobs);
	}

	function getConnectorViaEngineId(desiredEngineId, options) {
		if (cachedConnectorsToUsedUnderlyingEngines[desiredEngineId]) {
			return cachedConnectorsToUsedUnderlyingEngines[desiredEngineId];
		}

		const registeredFactory = registeredFactoriesForConnectorsOfUnderlyingEngines[desiredEngineId];

		if (typeof registeredFactory !== 'function') {
			throw new ReferenceError(chalk.bgRed.black(` Unknown underlying watch engine: "${desiredEngineId}". `));
		}

		const connectorDefinition = registeredFactory(options);
		cachedConnectorsToUsedUnderlyingEngines[desiredEngineId] = connectorDefinition;

		return connectorDefinition;
	}

	function connectToUnderlyingWatchEngine(desiredEngineId, options = {}) {
		if (currentUnderlyingWatchEngineId) {
			console.log(`Watch engine ("${
				chalk.magenta(currentUnderlyingWatchEngineId)
			}") of scope ${
				scopeIdPrintingString
			} has already connected before.`);

			return false;
		}

		desiredEngineId = getValidStringFrom(desiredEngineId);
		if (!desiredEngineId) {
			desiredEngineId = lastUsedUnderlyingWatchEngineId || defaultConfiguration.underlyingWatchEngineId;
		}

		// The statement below might throw to guard arguments.
		currentUnderlyingWatchEngineConnector = getConnectorViaEngineId(
			desiredEngineId,
			Object.assign({}, constructionOptions, options)
		);

		normalizedGlobs = toNormalizeGlobs(
			rawGlobsToWatch,
			currentUnderlyingWatchEngineConnector.toNormalizeOneGlob
		);

		printingVersionOfGlobs = toGetPrintVersionOfGlobs(
			rawGlobsToWatch,
			currentUnderlyingWatchEngineConnector.toGetPrintVersionOfOneGlob
		);

		// If nothing was thrown, then we are safe now.
		currentUnderlyingWatchEngineId = desiredEngineId;
		currentUnderlyingWatchEngineConnector.listenToEvents(
			watchingBasePath,
			normalizedGlobs,
			events
		);

		if (! isConstructingInstance || ! shouldStartWithLessLogs) {
			console.log('');
		}

		console.log(`${
			chalk.bgBlue.black(' Connected Watch Engine ')
		}${
			chalk.bgGreen.black(` ${currentUnderlyingWatchEngineId} `)
		}${
			scopeIdPrintingString
		} ${chalk.gray('~')}\nWatching glob(s):`);

		LazyWatcherClass.logGlobsAsAList(printingVersionOfGlobs);

		console.log('\n');

		if (typeof thisWatcher.onUnderlyingWatchEngineConnected === 'function') {
			thisWatcher.onUnderlyingWatchEngineConnected();
		}

		allowFutureActions();

		return true;
	}

	function disconnectCurrentUnderlyingWatchEngine(shouldFinishRestWork) {
		holdFutureActions(shouldFinishRestWork);

		if (! currentUnderlyingWatchEngineId) {
			return false;
		}

		currentUnderlyingWatchEngineConnector.removeAllListeners(events);

		lastUsedUnderlyingWatchEngineId = currentUnderlyingWatchEngineId;
		currentUnderlyingWatchEngineId = '';
		currentUnderlyingWatchEngineConnector = null;

		if (typeof thisWatcher.onUnderlyingWatchEngineDisconnected === 'function') {
			thisWatcher.onUnderlyingWatchEngineDisconnected(lastUsedUnderlyingWatchEngineId);
		}

		console.log(`\n${
			chalk.bgYellow.black(' Disconnected Watch Engine ')
		}${
			chalk.bgMagenta.black(` ${lastUsedUnderlyingWatchEngineId} `)
		}${
			scopeIdPrintingString
		}\n\n`);
	}

	function allowFutureActions() {
		if (actionsAreAllowedInTheFuture) {
			return;
		}

		actionsAreAllowedInTheFuture = true;
		if (! isConstructingInstance || !shouldStartWithLessLogs) {
			console.log(`${
				chalk.bgBlue.black(' Action Enabled ')
			} on scope ${scopeIdPrintingString}.`);

			if (shouldLogVerbosely) {
				console.log(`${
					chalk.bgGreen.black(' Watching Globs ')
				} on scope ${scopeIdPrintingString}...`);
			}
		}
	}

	function _startTimerForDelayedAction() {
		// console.log('trying to start timer');
		if (actionsAreAllowedInTheFuture && !currentTimerId && !actionIsOnGoing) {
			currentTimerId = setTimeout(takeActionOnce, delayTimeForTakingAction);

			if (shouldLogVerbosely) {
				console.log(`${
					chalk.bgGreen.black(' Timer set for action ')
				} on scope ${scopeIdPrintingString}...`);
			}
		}
	}

	function _stopTimerSoThatNoMoreActionsWillTake() {
		// console.log('trying to stop timer');
		if (currentTimerId) {
			clearTimeout(currentTimerId);
			currentTimerId = null;

			if (shouldLogVerbosely) {
				console.log(`${
					chalk.bgBlue.black(' Timer cleared ')
				} on scope ${scopeIdPrintingString}.`);
			}
		}
	}

	function holdFutureActions(shouldFinishRestWork) {
		_stopTimerSoThatNoMoreActionsWillTake();

		actionsAreAllowedInTheFuture = false;
		console.log(`\n${
			chalk.bgYellow.black(' Action Disabled ')
		} on scope ${scopeIdPrintingString}.`);

		if (shouldFinishRestWork) {
			takeActionOnce();
		}
	}

	function rememberAnEvent(typeOfTheChange, involvedFileRawPath) {
		const timestamp = Date.now();
		// console.log('remembering one issue');

		_startTimerForDelayedAction();

		somethingChangedAfterLastActionStart = true;

		const involvedFileNormalizedPath = currentUnderlyingWatchEngineConnector.toNormalizeOneGlob(involvedFileRawPath);

		const fileRecord = {
			timestamp,
			typeOfChange: currentUnderlyingWatchEngineConnector.abstractChangeTypeOfRawEventType[typeOfTheChange],
			rawTypeOfChange: typeOfTheChange,
			file: involvedFileNormalizedPath,
			scopeId,
		};

		if (shouldLogVerbosely) {
			console.log(`>>> ${LazyWatcherClass.getPrintStringOfOneInvolvedFile(fileRecord)}`);
		}

		knownChangesSoFar.push(fileRecord);
	}

	function _onActionFinished(theWayLeadsHere) {
		actionIsOnGoing = false;
		lastActionTakenTimestamp = NaN;

		if (shouldLogVerbosely) {
			console.log(`\n>>> ${
				chalk.blue('Action')
			} of the watcher for ${scopeIdPrintingString} is ${
				chalk.blue('done')
			}.\n    Told by the ${
				chalk.magenta(theWayLeadsHere.slice(4))
			}.`);
		}

		// 如果已经有后续变化，继续执行预设动作。
		// console.log('here on finish. Try accum task...');
		takeActionOnce();
		// console.log('here continue on finish. Action is on going again?', actionIsOnGoing);

		// 如果上面一句（即 takeActionOnce() ）重新使得 actionIsOnGoing 为 true，
		// 意味着已有任务在队列中等待至今，因此暂时仍不必调用 _startTimerForDelayedAction ，
		// 而是继续等待由上一语句启动的新一次动作结束。
		// 顺便：如果每每执行至此行，actionIsOnGoing 总是 true，
		// 则意味着异步执行的任务较慢，文件变动事件发生得较快、较频繁。
		// 这种情况没有害处，仅仅是文件变动积攒很快，每批次处理的文件数较多罢了。
		if (! actionIsOnGoing) {
			_startTimerForDelayedAction();

			if (shouldLogVerbosely) {
				console.log(`${
					chalk.bgGreen.black(' Watching Globs ')
				} on scope ${scopeIdPrintingString}...`);
			}
		}
	}

	function actionFinishedCallback(/* info */) {
		_onActionFinished('via callback');
	}

	function takeActionOnce(isForcedToTakeAction, options) {
		isForcedToTakeAction = !!isForcedToTakeAction;

		// console.log(
		// 	'tyring to take action once\n',
		// 	'  ', isForcedToTakeAction || actionsAreAllowedInTheFuture,
		// 	isForcedToTakeAction || !actionIsOnGoing,
		// 	isForcedToTakeAction || somethingChangedAfterLastActionStart
		// );

		_stopTimerSoThatNoMoreActionsWillTake();

		if (! isForcedToTakeAction) {
			if (! actionsAreAllowedInTheFuture) {
				return;
			}

			if (actionIsOnGoing) {
				return;
			}

			if (! somethingChangedAfterLastActionStart) {
				return;
			}
		}

		// console.log('taking action once. forced to?', isForcedToTakeAction);

		actionIsOnGoing = true;

		const changesWeAreDealingWith = [].concat(knownChangesSoFar);


		knownChangesSoFar = [];
		somethingChangedAfterLastActionStart = false;


		lastActionTakenTimestamp = new Date().getTime();
		const detailsOfThisBatch = {
			isForcedToTakeAction,
			scopeId,
			timestamp: lastActionTakenTimestamp,
			fileRecords: changesWeAreDealingWith,
		};

		if (! isConstructingInstance || ! shouldStartWithLessLogs) {
			LazyWatcherClass.logABatchOfInvolvedFilesForScope(scopeId, detailsOfThisBatch, options);
		}

		const returnedValue = actionToTake(actionFinishedCallback, detailsOfThisBatch);

		if (returnedValue === defaultConfiguration.actionReturnValueThatStandsForFinish) {
			_onActionFinished('via returned value');
		} else if (isAPromiseObject(returnedValue)) {
			returnedValue.done(() => { _onActionFinished('via Promise object'); });
		}
	}
}






LazyWatcherClass.defaultConfiguration = defaultConfiguration;

LazyWatcherClass.terms = {
	FILE_ENTERING_SCOPE: TERM_FOR_FILE_ENTERED_SCOPE,
	FILE_DISAPPEARANCE:  TERM_FOR_FILE_DISAPPEARED,
	FILE_RENAMED:        TERM_FOR_FILE_RENAMED,
	FILE_MODIFIED:       TERM_FOR_FILE_MODIFIED,
	UNKNOWN_FILE_CHANGE: TERM_FOR_UNKNOWN_FILE_CHANGE,
};

LazyWatcherClass.defaultMethodToNormalizeOneGlob = rawGlob => rawGlob;

LazyWatcherClass.getPrettyPrintingStringOfScopeId = (scopeId) => {
	const foldingChar = consoleDoesSupportColors ? ' ' : '"';
	return chalk.bgYellow.black(`${foldingChar}${scopeId}${foldingChar}`);
};

LazyWatcherClass.logGlobsAsAList = (globs, indentation = 4) => {
	const globsListString = globs.reduce((accumString, glob) => {
		const hasNegativeSign = glob.slice(0, 1) === '!';
		const globString = hasNegativeSign ?
			`${' '.repeat(indentation - 2)}${chalk.red('!')} ${chalk.red(glob.slice(1))}` :
			`${' '.repeat(indentation)}${chalk.green(glob)}`;
		return `${accumString}${globString}\n`;
	}, '');

	console.log(globsListString);
};

LazyWatcherClass.logInvolvedFileRecordsAsAList = (fileRecords) => {
	if (fileRecords.length < 1) {
		console.log(`    ${chalk.gray('<none>')}`);
		return;
	}

	const listString = fileRecords.reduce((accumString, fileRecord) => {
		return `${accumString}    ${LazyWatcherClass.getPrintStringOfOneInvolvedFile(fileRecord, true)}\n`;
	}, '');

	console.log(listString);
};

LazyWatcherClass.logABatchOfInvolvedFilesForScope = (scopeId, detailsOfThisBatch, options = {}) => {
	const {
		extraMessage,
		shouldNotPrintInvolvedFileList,
	} = options;

	const labelString = detailsOfThisBatch.isForcedToTakeAction ?
		chalk.bgYellow.black(' FORCED to Take Action ') :
		chalk.bgGreen.black(' Taking Action ');

	console.log(`\n${
		chalk.gray(formatTimestamp(detailsOfThisBatch.timestamp))
	} ${labelString}${chalk.bgWhite.black(' on scope ')}${
		LazyWatcherClass.getPrettyPrintingStringOfScopeId(scopeId)
	}${extraMessage ? `\n${' '.repeat(9)}${extraMessage}` : ''}...`);

	if (! shouldNotPrintInvolvedFileList) {
		console.log(`${' '.repeat(13)}Involved file(s) in this batch:`);
		LazyWatcherClass.logInvolvedFileRecordsAsAList(detailsOfThisBatch.fileRecords);
	}
};

LazyWatcherClass.getLoggingTermAndStyleForAnEvent = (typeOfTheChange) => {
	let loggingKeyColor;
	let loggingKeyBgColor;
	let termOfEventType = typeOfTheChange;
	let termOfEventTypeButInAlignedWidth = '';

	const termsAlignedWidth = Math.max(
		// termUnknownType.length,
		TERM_FOR_FILE_ENTERED_SCOPE.length,
		TERM_FOR_FILE_DISAPPEARED.length,
		TERM_FOR_FILE_RENAMED.length,
		TERM_FOR_FILE_MODIFIED.length
	);

	/* eslint-disable indent */
	switch (typeOfTheChange) {
		case TERM_FOR_FILE_MODIFIED:
			loggingKeyColor   = 'blue';
			loggingKeyBgColor = 'bgBlue';
			break;

		case TERM_FOR_FILE_ENTERED_SCOPE:
			loggingKeyColor   = 'green';
			loggingKeyBgColor = 'bgGreen';
			break;

		case TERM_FOR_FILE_DISAPPEARED:
			loggingKeyColor   = 'red';
			loggingKeyBgColor = 'bgRed';
			break;

		case TERM_FOR_FILE_RENAMED:
			loggingKeyColor   = 'cyan';
			loggingKeyBgColor = 'bgCyan';
			break;

		default:
			termOfEventType   = TERM_FOR_UNKNOWN_FILE_CHANGE;
			loggingKeyColor   = 'black';
			loggingKeyBgColor = 'bgWhite';
			break;
	}
	/* eslint-enable indent */

	termOfEventTypeButInAlignedWidth = ' '.repeat(Math.max(0, termsAlignedWidth - termOfEventType.length));

	return {
		loggingKeyColor,
		loggingKeyBgColor,
		termOfEventType,
		termOfEventTypeInAlignedWidth: termOfEventTypeButInAlignedWidth,
	};
};

LazyWatcherClass.getPrintStringOfOneInvolvedFile = (fileEventRecord, shouldOmitScopeInfo) => {
	const {
		timestamp,
		scopeId,
		typeOfChange,
		file,
	} = fileEventRecord;


	const {
		loggingKeyColor,
		loggingKeyBgColor,
		termOfEventType,
		termOfEventTypeInAlignedWidth,
	} = LazyWatcherClass.getLoggingTermAndStyleForAnEvent(typeOfChange);


	return `${
		chalk.gray(formatTimestamp(timestamp))
	} ${
		shouldOmitScopeInfo ? '' : LazyWatcherClass.getPrettyPrintingStringOfScopeId(scopeId)
	}${
		chalk[loggingKeyBgColor].black(` ${termOfEventType} `)
	}${
		termOfEventTypeInAlignedWidth
	} ${
		chalk[loggingKeyColor](file)
	}`;
};

LazyWatcherClass.getFactoryForConnectorOfARegisteredUnderlyingWatchEngine = (desiredEngineId) => {
	return registeredFactoriesForConnectorsOfUnderlyingEngines[desiredEngineId];
};

LazyWatcherClass.getAllFactoriesForConnectorsOfAllRegisteredUnderLyingWatchEngines = () => {
	return Object.assign({}, registeredFactoriesForConnectorsOfUnderlyingEngines);
};

LazyWatcherClass.validateAConnectorDefinition = (connectorToCheck, engineId) => { // eslint-disable-line max-statements
	if (!engineId) {
		engineId = '<Unspecified engine>';
	}

	const logStringForError = `\n${
		chalk.bgRed.black(' Type Error ')
	}\n  ${
		chalk.red(` The created connector for engine "${chalk.white(engineId)}" is invalid. `)
	}`;

	const logString1 = `The created connector for engine "${chalk.white(engineId)}"`;





	if (! connectorToCheck || typeof connectorToCheck !== 'object') {
		console.log(logStringForError);
		throw new TypeError();
	}


	const {
		abstractChangeTypeOfRawEventType,
		listenToEvents: toListenToEvents,
	} = connectorToCheck;

	let {
		toNormalizeOneGlob,
		toGetPrintVersionOfOneGlob,
		removeAllListeners: toRemoveAllListeners,
	} = connectorToCheck;




	if (! abstractChangeTypeOfRawEventType || typeof abstractChangeTypeOfRawEventType !== 'object') {
		console.log(`${logStringForError}\n  ${
			chalk.red(` It MUST contain an object property named "${
				chalk.white('abstractChangeTypeOfRawEventType')
			}". `)
		}\n`);

		throw new TypeError();
	} else {
		let termEnteredScopeMappedCount = 0;
		let termDisappearedMappedCount = 0;
		let termRenamedMappedCount = 0;
		let termModifiedMappedCount = 0;

		const rawEventTypes = Object.keys(abstractChangeTypeOfRawEventType);
		rawEventTypes.forEach(rawType => {
			const mappedType = abstractChangeTypeOfRawEventType[rawType];

			if (mappedType === TERM_FOR_FILE_ENTERED_SCOPE) {
				termEnteredScopeMappedCount++;
			}

			if (mappedType === TERM_FOR_FILE_DISAPPEARED) {
				termDisappearedMappedCount++;
			}

			if (mappedType === TERM_FOR_FILE_RENAMED) {
				termRenamedMappedCount++;
			}

			if (mappedType === TERM_FOR_FILE_MODIFIED) {
				termModifiedMappedCount++;
			}
		});

		if (termEnteredScopeMappedCount < 1) {
			logOneUnmappedEventType(TERM_FOR_FILE_ENTERED_SCOPE, engineId);
		}

		if (termDisappearedMappedCount < 1) {
			logOneUnmappedEventType(TERM_FOR_FILE_DISAPPEARED, engineId);
		}

		if (termRenamedMappedCount < 1) {
			logOneUnmappedEventType(TERM_FOR_FILE_RENAMED, engineId);
		}

		if (termModifiedMappedCount < 1) {
			logOneUnmappedEventType(TERM_FOR_FILE_MODIFIED, engineId);
		}

		if (
			termEnteredScopeMappedCount < 1 ||
			termDisappearedMappedCount  < 1 ||
			termRenamedMappedCount      < 1 ||
			termModifiedMappedCount     < 1
		) {
			console.log('');
		}
	}

	function logOneUnmappedEventType(term, engineId) {
		console.log(chalk.bgYellow.black(
			`Event ${
				chalk.bgMagenta.black(` ${term} `)
			} is not mapped by connector of ${
				chalk.bgGreen.black(` ${engineId} `)
			}`
		));
	}

	if (typeof toListenToEvents !== 'function') {
		console.log(`${logStringForError}\n  ${
			chalk.red(` It MUST contain a method named "${chalk.white('listenToEvents')}". `)
		}\n`);

		throw new TypeError();
	}

	if (typeof toRemoveAllListeners !== 'function') {
		console.log(`\n${chalk.bgYellow.black(' WARNING ')}:\n    ${
			chalk.yellow(`${
				logString1
			}\n    has ${
				chalk.magenta('NO')
			} method named "${
				chalk.green('removeAllListeners')
			}".`)
		}\n`);

		toRemoveAllListeners = createPsuedoMethodForRemovingEventListenersFromAnEngine(engineId);
	}

	if (typeof toNormalizeOneGlob !== 'function') {
		toNormalizeOneGlob = LazyWatcherClass.defaultMethodToNormalizeOneGlob;
	}

	if (typeof toGetPrintVersionOfOneGlob !== 'function') {
		toGetPrintVersionOfOneGlob = toNormalizeOneGlob;
	}



	const validConnector = {
		toNormalizeOneGlob,
		abstractChangeTypeOfRawEventType,
		listenToEvents: toListenToEvents,
		toRemoveAllListeners,
		toGetPrintVersionOfOneGlob,
	};


	return validConnector;
};

LazyWatcherClass.registerConnectorForOneUnderlyingWatchEngine = (engineId, toCreateOneConnector) => {
	engineId = getValidStringFrom(engineId);
	if (!engineId) {
		throw new TypeError(chalk.bgRed.black(' Invalid engine id provided. MUST be a non empty string. '));
	}

	let decidedConnectorFactory;

	if (typeof toCreateOneConnector === 'function') {
		decidedConnectorFactory = (options) => {
			const createdConnector = toCreateOneConnector(options);

			// The statement below might throw to guard arguments.
			const validConnector = LazyWatcherClass.validateAConnectorDefinition(createdConnector, engineId);

			// If nothing was thrown, then we are safe now.
			return validConnector;
		};
	} else {
		// Otherwise it is expected to be a valid definition object literal.
		const theDirectlyProvidedConnector = toCreateOneConnector;

		// The statement below might throw to guard arguments.
		const validConnector = LazyWatcherClass.validateAConnectorDefinition(theDirectlyProvidedConnector, engineId);

		// If nothing was thrown, then we are safe now.
		decidedConnectorFactory = () => {
			return Object.assign({}, validConnector);
		};
	}

	registeredFactoriesForConnectorsOfUnderlyingEngines[engineId] = decidedConnectorFactory;

	return decidedConnectorFactory;
};







function createPsuedoMethodForRemovingEventListenersFromAnEngine(engineId) {
	return () => {
		console.log(`${chalk.bgYellow.black(' WARNING ')
		}: ${
			chalk.yellow(`For engine "${
				chalk.red(engineId)
			}", the method for removing event handlers for not implemented yet!`)
		}`);
	};
}

function formatTimestamp(timestamp) {
	const dateObjectOfTheTime = new Date(timestamp);

	const hours   = dateObjectOfTheTime.getHours();
	const minutes = dateObjectOfTheTime.getMinutes();
	const seconds = dateObjectOfTheTime.getSeconds();

	return [
		hours   < 10 ? `0${hours}`   : `${hours}`,
		minutes < 10 ? `0${minutes}` : `${minutes}`,
		seconds < 10 ? `0${seconds}` : `${seconds}`,
	].join(':');
}


module.exports = LazyWatcherClass;