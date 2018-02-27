# NPM Page

[@wulechuan/scoped-glob-watchers](https://www.npmjs.com/package/@wulechuan/scoped-glob-watchers)

<br/>
<br/>
<br/>
<br/>

# Introduction

This is a controller for multiple scoped lazy watchers upon globs/files.

<br/>
<br/>

## Scopes

A scope here means one or several globs.
A given watcher watches every file the said globs cover.
Whenever some change happened to any of those files,
a pre-defined action will be taken to response that change.
The response, aka the action ,make the watcher meaningful.
Otherwise, why do we watch a file?

*In words, a scope is mapped to an action by a watcher.*

> The term `glob` basically means a description
> on how we can select some files we are interested in.
> See: https://www.npmjs.com/package/glob#glob-primer

It's worth to mention that a certain file is allowed and often needed to
be covered in several scopes. So that when the said file changes,
several actions will be taken at the same time.

*In words, one change might cause multiple actions.*

<br/>
<br/>

## Lazy Meshanism

A watcher is called a **lazy** one is because when a file changing event issues,
the watcher doesn't take actions bound to that change immediately,
but rather waits for a short period of time (*by default `900` milli seconds*)
to gather more changes of files,
be those changes happen to be of the same file, or not.
When the time is up for the said wait, the watcher acts as desired.

This meshanism is meaningful in lots of cases
where a batch of files change almost at the same time,
while they all are bound to the same action,
and they are meant to share the single take of the action.

Say we are saving a bunch of files in one go
via a shortcut key in a powerful code editor,
like using the "<kbd>Ctrl+k s</kbd>" in
Microsoft [Visual Studio Code](https://code.visualstudio.com/).
When several `.styl` files might change at the same time,
only one single compilation action is expected to be taken upon all these changes.

<br/>
<br/>

## Multiple Watchers and One Controller over Them

Obviously we often need several watchers to watch different scopes.
For conveniences, I build this watchers controller,
which basically can create and handle multiple watchers in one go,
each watcher bound to a certain scope, aka some files on your file system.

<br/>
<br/>

## Underlying File Watching Engines

Currently the controller, or the mechanism, whatever,
utilizes only the [gaze](https://github.com/shama/gaze)
as the underlying file watching engine.
Though theoretically the controller could connect to any other watching engine,
as long as a connector is provided (which is not).

<br/>
<br/>
<br/>
<br/>

# Usage

## Example Codes

See the `gulpfile.js` included by this repository as an example.

Below are the key snippets from the said `gulpfile.js`.

```javascript
const npmProjectRootPath = prosess.cwd();

const scopedGlobsLazilyWatchingMechanism = require('.');

// Three scopes are defined below.
// And three watchers will be created for them each.
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
	scopedGlobsLazilyWatchingMechanism.createWatchersAccordingTo(
		scopedWatchingSettings,
		{
			basePath: npmProjectRootPath,
			// shouldLogVerbosely: false,
		}
	);

	thisTaskIsDone();
});
```

<br/>
<br/>

## Try it out

There is a dummy project includes in this repository,
so that people can try this watchers controller without difficulty.

The said dummy project locates at
```sh
<this repository root folder>/try-it-out/a-dummy-project
```

<br/>

A npm script entry of this repository has been setup
to run an instance of this watchers controller,
utilizing [gulp](https://gulpjs.com/).


To start, simply open a console/terminal and run:
```sh
npm start
```

When the script is running,
the controller first create 3 watchers,
each for a scope covering some files in the dummy project.

> Note that the scopes are designed to together cover all files in that project.
> So any file change will for sure cause some action.

<br/>

> Also note that it's the dummy project files that are watched, **not** the source files of this repository.

Then you can randomly make changes to those files.
For example you can modify contents of some files,
create some new files,
or delete existing ones.
Keep an eye on the console/terminal,
you should see beautiful messages logged there.


See some snapshots of mine:

At the moment the script just start:
![Just started](./docs/illustrates/npm-start-snapshot-01.png "right after npm start")

After some changes are made:
![After Some Changes](./docs/illustrates/npm-start-snapshot-02.png "after some changes are made")

<br/>
<br/>
<br/>
<br/>

# API

Sorry. I don't have too much spare time at present.
I have my boy to take care of.

Cosume my *ugly* source codes if you'd like to. :p
