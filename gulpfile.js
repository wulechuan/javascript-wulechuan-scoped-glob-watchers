/* eslint no-console: 0, global-require: 0, no-buffer-constructor: 0, indent: [ 2, 'tab' ], no-tabs: 0 */

const gulp = require('gulp');

const pathTool = require('path');
const { join: joinPath } = pathTool;

const scopedGlobsLazilyWatchingMechanism = require('.');

/*
*
*
*
*
*
*
* ****************************************
*               整理环境常量
* ****************************************
*/

// --------------- 基本常量 ---------------

const npmProjectRootPath = process.cwd();
const packageJSON = require(joinPath(npmProjectRootPath, 'package.json')); // eslint-disable-line import/no-dynamic-require

const {
	tryoutDummyProject: dummySourceCodeRootFolder,
} = packageJSON.directories;


// --------------- globs ---------------

const sourceGlobsOfImagesToWatch = [
	joinPath(dummySourceCodeRootFolder, 'images', '**/*'),
];

const sourceGlobsOfStylusToWatch = [
	joinPath(dummySourceCodeRootFolder, 'stylus', '**/*.styl'),
];

const sourceGlobsOfJavascriptToWatch = [
	joinPath(dummySourceCodeRootFolder, 'javascript', '**/*.js'),
];

/*
*
*
*
*
*
*
* *****************************************************
*       加载与任务相关的自定义通用工具；构建任务主体函数
* *****************************************************
*/

const taskBodyOfCompilingStylus = function (thisTaskIsDone) {
	delayAnActionWithinTimeRange(500, 1500, (spentTime) => {
		console.log(`[${spentTime}ms] Build: Compilation of Stylus -> CSS ... Done.`);
		thisTaskIsDone();
	});
};

const taskBodyOfCompilingJavascripts = function (thisTaskIsDone) {
	delayAnActionWithinTimeRange(300, 1900, (spentTime) => {
		console.log(`[${spentTime}ms] Build: Compilaction of Javascripts ... Done.`);
		thisTaskIsDone();
	});
};

const taskBodyOfCopyingImages = function (thisTaskIsDone) {
	delayAnActionWithinTimeRange(51, 790, (spentTime) => {
		console.log(`[${spentTime}ms] Build: Copying Images ... Done.`);
		thisTaskIsDone();
	});
};

function delayAnActionWithinTimeRange(minTime, maxTime, action) {
	const timeToTake = minTime + Math.ceil(Math.random() * (maxTime - minTime));
	let stringTimeToTake = ''+timeToTake;

	const paddingCount = Math.max(0, 4 - stringTimeToTake.length);
	stringTimeToTake = `${' '.repeat(paddingCount)}${stringTimeToTake}`;

	setTimeout(() => action(stringTimeToTake), timeToTake);
}

/*
*
*
*
*
*
*
* ****************************************
*                  任务集
* ****************************************
*/

// Tasks that builds and watches
const scopedWatchingSettings = {
	'My Lovely Images': {
		globsToWatch:                      sourceGlobsOfImagesToWatch,
		actionToTake:                      taskBodyOfCopyingImages,
		shouldTakeActionOnWatcherCreation: true,
	},
	'CSS: Stylus': {
		globsToWatch:                      sourceGlobsOfStylusToWatch,
		actionToTake:                      taskBodyOfCompilingStylus,
		shouldTakeActionOnWatcherCreation: true,
	},
	'Javascript': {
		globsToWatch:                      sourceGlobsOfJavascriptToWatch,
		actionToTake:                      taskBodyOfCompilingJavascripts,
		shouldTakeActionOnWatcherCreation: true,
	},
};


gulp.task('build and then watch: everything', (thisTaskIsDone) => {
	scopedGlobsLazilyWatchingMechanism.createWatchersAccordingTo(scopedWatchingSettings, {
		basePath: npmProjectRootPath,
		// shouldLogVerbosely: false,
	});

	thisTaskIsDone();
});




// The default task
gulp.task('default', [ 'build and then watch: everything' ]);
