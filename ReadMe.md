# Introduction

This is a lazy watchers controller for globs/files.

A watcher is called a **lazy** one is because when a file changing event issues,
the watcher doesn't take actions bound to that file change immediately,
but rather waits for a short period of time (*by default 900 milli seconds*)
to gather more changes of files,
be those changes happen to be of the same file, or not.
When the time is up for the said wait, the watcher act as desired.

This meshanism is meaningful in lots of cases
where a batch of files change almost at the same time,
while they all are bound to the same action,
and they are meant to share the single take of the action.

Say we are saving a bounch of files via a shortcut key in a powerful code editor,
like using the "<kbd>Ctrl+k s</kbd>" in [Microsoft Visual Studio Code](https://code.visualstudio.com/).
When several `.styl` files might change at the same time,
but a single compilation action is expected to be taken upon all these changes.

Currently the controller, or the mechanism, whatever, utilizes only the [gaze](https://github.com/shama/gaze) as the underlying file watching engine.
Though theoretically the controller could connect to any other watching engine,
as long as a connector is provided.

<br/>
<br/>
<br/>
<br/>

# Usage

See the `gulpfile.js` included by this repository as an example.

Below are the key snippets from the said `gulpfile.js`.

```javascript
const scopedGlobsLazilyWatchingMechanism = require('.');

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
```

<br/>
<br/>
<br/>
<br/>

# API

Sorry. I don't have too much spare time at present. I have my boy to take care of.

Cosume my *ugly* source codes if you'd like to. :p
