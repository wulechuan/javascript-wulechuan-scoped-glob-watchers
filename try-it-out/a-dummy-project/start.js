const path = require('path');
const joinPathPOSIX = path.posix.join;

const scopedGlobsLazilyWatchingMechanism = require('../../source');


const npmProjectRootPath = path.dirname(require.resolve('../../package.json'))
const packageJSON = require('../../package.json');

const {
    tryoutDummyProject: dummySourceCodeRootFolder,
} = packageJSON.directories;


// --------------- globs ---------------

const sourceGlobsOfImagesToWatch = [
    joinPathPOSIX(dummySourceCodeRootFolder, 'images', '**/*'),
];

const sourceGlobsOfStylusToWatch = [
    joinPathPOSIX(dummySourceCodeRootFolder, 'stylus', '**/*.styl'),
];

const sourceGlobsOfJavascriptToWatch = [
    joinPathPOSIX(dummySourceCodeRootFolder, 'javascript', '**/*.js'),
    `!${joinPathPOSIX(dummySourceCodeRootFolder, 'something-does-not-exist-at-all', '**/*.js')}`,
];


// --------------- actions ---------------

const fakeActionOfCompilingStylus = function (thisTaskIsDone) {
    delayAnActionWithinTimeRange(500, 1500, (spentTime) => {
        console.log(`[${spentTime}ms] Build: Compilation of Stylus -> CSS ... Done.`);
        thisTaskIsDone();
    });
};

const fakeActionOfCompilingJavascripts = function (thisTaskIsDone) {
    delayAnActionWithinTimeRange(300, 1900, (spentTime) => {
        console.log(`[${spentTime}ms] Build: Compilaction of Javascripts ... Done.`);
        thisTaskIsDone();
    });
};

const fakeActionOfCopyingImages = function (thisTaskIsDone) {
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




const basePathForShorteningPathsInLog = joinPathPOSIX(
    npmProjectRootPath,
    'try-it-out/a-dummy-project'
)


// Three scopes are defined below.
// And three watchers will be created for them each.
const scopedWatchingSettings = {
    'My Lovely Images': {
        globsToWatch:                      sourceGlobsOfImagesToWatch,
        actionToTake:                      fakeActionOfCopyingImages,
        shouldTakeActionOnWatcherCreation: true,
    },
    'CSS: Stylus': {
        globsToWatch:                      sourceGlobsOfStylusToWatch,
        actionToTake:                      fakeActionOfCompilingStylus,
        shouldTakeActionOnWatcherCreation: true,
    },
    'Javascript': {
        // This one below overrides the same property in the shared settings.
        basePathForShorteningPathsInLog:   joinPathPOSIX(basePathForShorteningPathsInLog, 'javascript'),

        globsToWatch:                      sourceGlobsOfJavascriptToWatch,
        actionToTake:                      fakeActionOfCompilingJavascripts,
        shouldTakeActionOnWatcherCreation: true,
    },
};

scopedGlobsLazilyWatchingMechanism.createWatchersAccordingTo(
    scopedWatchingSettings,


    /**
        Below is an object containing some shared options across all scopes.
        If a property of same name exists in an scope settings,
        the value of the scope property will be taken,
        intead of the one defined below.
    */
    {
        // Optional but important. Default to process.cwd()
        watchingBasePath: npmProjectRootPath,

        // Optional. Just for better logging.
        basePathForShorteningPathsInLog,

        shouldLogVerbosely: false,
    }
);
