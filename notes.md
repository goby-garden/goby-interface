#### <span class="date">8/26/2025</span> - Some meditations on focus state

_A clarification:_ by focus state I mean a lot more than native input focuses; I’m thinking about all the custom interface elements which have some sort of transitory “editing” state or dialog box, and which typically close out when you interact with something outside of them.

**Behavior:**

I’m debating about what should happen when you click on another focusable element when you are already focused. Should it:

1. immediately focus the next thing
    - this is the default behavior of most inputs on the web
    - PRO: less friction if you are going between quickly inputs
    - CON: reduces ability to escape to a passive/rest state with the mouse
2. simply unfocus the current thing, and require you to click again to focus anything else 
    - this is the behavior of many application input fields
    - PRO: preserves the ability to go back to a rest state at any time by clicking anywhere
    - CON: creates a lot more friction if someone is moving between fields

I think the challenge with a “table” style presentation is that inputs often fill the entire viewport, so there’s no good place to click “off”. I’m reminded of visiting my father’s office as a child, and playing on the sticky mats installed in door frames to minimize dust in the lab. Using approach #1 on a table would sort of feel like that: wherever you click (step), the page (floor) lightly grabs onto you. Accordingly I think in these sorts of interfaces, developers often opt for approach #2.

_However_, as a user of other table interfaces, I get really frustrated with the slowness and dissonance that this click-to-exit system creates. It’s like once there’s one thing focused, a forcefield is erected in front of the other interactive elements, and I find myself constantly double clicking to break through it. 

So I am inclined towards approach #1. Some ideas to mitigate the “stickiness”:

- offer some kind of universal `close`/`esc` button, which lives in a corner of the viewport and appears whenever you have something open. 
   - If I do label it `esc`, it could also act as a hint/incentive to use the keyboard Escape key to return to the rest state.
- be a little more conservative with the clickable regions to focus something, e.g. for text strings make the actual text region the clickable part instead of the whole cell with all its white space.


**Implementation**: 

My current approach to tracking focus state (from when I set up text field editing a few months ago) is a store which records relevant identifiers for the element currently focused (e.g. class id, block id, etc and the svelte-generated $props.id() for the component). I’m worried that this will get a little convoluted, and I don’t entirely remember why I took that approach, although I remember agonizing over it a little bit. 

Keep it or not though, I think it’s clear what my focus system needs to be able to do:

- record the current item that is focused, so that every item can check whether it _is_ that focusable element can compare itself and display accordingly
- end focus on the currently focused element if someone clicks elsewhere
- (here is the tricky one) accomodate, through one form or another, _nested_ search, so that an element can be focused inside of another focused element

I’d like to achieve all this with the most data and UI-agnostic approach possible.

Maybe what I do is something really absurdly simple and DOM-based:

- utilize `$props.id()` to generate element IDs for “focusable” elements
- when an element becomes focused, its ID gets added to an array store
    - when you focus on a nested element, before adding it, walk up the array store and use `contains()` to search for parent-child relationships to each element;
        - if they exist, keep the parent focused
        - if not, remove that from the focused items
- in any individual component, to check if it’s focused you just search for its ID in the array store.

Yeah this actually sounds pretty good to me. The one thing that concerns me is that if I need any kind of component to _keep track of_ things like whether its parent is focused, the `contains()` may become a performance issue. Maybe there’s a simple (albeit annoying) workaround like passing a prop called `parent_focused` down from above.


...or maybe another option is... to not keep track of this globally (lol)? I suppose what I could do is just listen to mousedown events in focused components and decide whether to close them based on whether the thing clicked on is a child element.


#### <span class="date">7/20/2025</span>

Following up on my thoughts [here](https://www.are.na/block/37686352) about the selection field display, what I’d like to set up is two display modes:

- A: listed with the little square “bullets” and no line breaks by default
- B: collapsed into a wrapping list with a fixed width 
   - undecided on whether it should retain the degree of conventional tag UI that I had in my initial sketches
   - coordinately with this, unsure if items should wrap inline-block style or wrap together like a regular comma-separated list
   
For now, I will focus on A, and not add any max width setting logic. I will also not worry about max _height_/truncation logic, which may be something I want to look into eventually

And I’d like to explore a mode of interaction that feels more inline:

- rather than opening up a complete edit overlay, the ability to click on individual items to select/remove them
- To add new items, you click on an unpopulated area and it gives you a text field plus a list of options you can select from, which gets filtered as you type. If nothing matches, you can hit enter to just add it as a new item, which then gets added to the corresponding selected class
    - it occurs to me that I probably also want some indication of this “linked” action, e.g. a little snackbox that pops up when you do this telling you it’s generated a new item in the corresponding class


#### <span class="date">6/25/2025</span>

For my future reference, since I’ve had to do it a few times between this project and work: if you’re trying to [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) an array to an object with generic `[key:string]:value` pairs, you need to do a few things for it to work and for typescript to stop complaining:

- define the param type of the `accumulator` in the callback function to be a generic object.
- have the callback function return the `accumulator` object (I thought this was a typescript thing but it’s occurring to me that this is probably just how `reduce` works; it needs the return to track the accumulator across each iteration)


#### <span class="date">6/23/2025</span>

When it comes time to start writing data from the interface back to the project databases, I think I can use whatever “write” procedure I set up as a centralized hook to re-fetch affected class data. E.g.:

- when relation props are modified, trigger linked classes to re-fetch, either wholesale or limited to columns/rows (or even cells)
- similarly when label text changes, trigger classes that select from it to re-fetch.

#### <span class="date">6/22/2025</span>

I’m leaving off tonight halfway through implementing the relation property cell display - got pretty far but I’m figuring out my approach to retrieving and caching data as I build this, and there’s a lot more to go than what I have the time to do before bed. 

With regard to data: I’m realizing that having the metadata for each class on hand is going to be pretty important, since I need information from these classes to correctly render their items as part of relation property cells. Since this metadata a pretty trivial amount of information, I think it’s okay to serve it up front.

The only part of the database which I think I need to avoid being greedy about is the items, since it’s totally plausible that someone would have a memory-pushing amount of items in their database, and I actively intend to implement pagination. Now this is a misplaced goby-database thought, but I think I should move away from caching these at all on the backend. If I need to do any operation that transforms them, I can ‘stream’ them in a paginated loop without saving them beyond that. And then instead when I retrieve the classes, I can specifically pull the paginated portion that I need for any displayed classes and serve it up.


#### <span class="date">6/16/2025</span>

As I’m starting to set up the table, one thing that’s becoming clear is I need to figure out how to save and ultimately edit the display state in various ways. Specifically:

- toggle text prop wrapping
- prop column width:
    - should it be responsive to the window in some way?
    - should it be constrained to a grid?
    - what should the default be? I.e. How should it decide the width of columns without any user configuration?



#### <span class="date">5/3/2025</span>

I did some initial work the other day to set up the retrieval of class data and rendering of the table; ambiently it prompted some ideation on another display style which I think will ultimately be more interesting and useful than the table, and also some dangerous contemplation of the possibility of items which exist in multiple classes. But these are things to explore if/once I can implement this initial vision,i.e. a class of items represented as a table, editable via the diagrammatic property editor interface that I’ve sketched.

The next steps of that implementation are:

- [ ] setting up individual components for different kinds of property inputs, e.g. text, single/multiple select, etc, and 
    - will need to figure out data binding and how to trigger saves to the database/refreshes of data (which as I described earlier, I would like to do more surgically)
- [ ] column width and similar workspace display configuration options
    - I’m hesitant to implement this before giving more thought to the schema and the specific display settings I want; but the column width thing in particular is just one of those things that is bugging me as a user while I test out the tool; maybe there’s some sort of stopgap solution I can implement for now.



#### <span class="date">4/27/2025</span>

...on the other hand, if I ever port this so that you can access a project over a network connection, e.g. via an app, I don’t want to be in a situation where goby has to send a bunch of small requests to load anything. So here’s a potential balance to strike: the workspace request can fetch an array of its blocks and an array of item data for each of those blocks. Still TBD whether it also include class item data, or whether that would be a separate request. But possibly it could include the first page of a paginated item set for each class.

#### <span class="date">4/26/2025</span>

I’m leaning towards loading project data in a distributed way, on a component-level, rather than what I did in the initial implementation, i.e. load everything all at once and reload it all for every change. This will hopefully prevent overfetching data from the database, but it will require me to do some fine-tooth combing when it comes refreshing and propagating the latest data in the interface:

- when a relation prop changes, any items in the targeted classes that changed will have to be re-fetched
- I would ideally want to avoid re-fetching the same asset so that all edits are immediately reactive; e.g. if I have two views of the same class in the same workspace. So I would probably want to centrally record what I’ve fetched as a cache that I pull from and refresh as needed


#### <span class="date">4/7/2025</span>

I am feeling a little beleaguered after spending many hours this weekend trying to get the electron program to start, 
amidst challenges with [JS module syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), typescript compilation, and of course the [classic mismatch](#better-sqlite3-misadventures) between the node version electron uses and the version for which better-sqlite3 was compiled. But with this push, the thing is finally alive, and hopefully I can begin development in earnest on the interface soon!


#### <span class="date">4/5/2025</span>

Some steps to get this thing up and running:

- set up a function to open/create a database file and present a blank window
    - can keep my original open file dialog for now
- possibly use the sandbox in `goby-database` to create one of my classic typeface test databases


#### <span class="date">1/20/2025</span>

Since last touching this repo many things have changed in my tooling + my perspective:

- I’ve refactored/overhauled `goby-database` in a way that likely deprecated some of the back-end code I had set up
- Svelte 5 is a thing that I want to use
- Typescript is a thing that I want to use both with svelte and electron
- I’m rethinking my interface dev priorities:
    - Instead of with standalone objects, I want to begin with the class interface (as tables, cards, or something else) and more importantly with the **class schema editor**, which is maybe the most unique and personally interesting aspect of this.
    - I don’t know if the idea of a canvas is as important to me as it was? I could totally imagine starting with a basic editor for a single class placed normally in the dom (maybe with the ability to tab between classes). 

To all these ends, I’ve done a complete overhaul of the directory structure and run commands, so now I can use typescript, svelte 5 and my update to `goby-database` are installed, the distribution code is more clearly bundled/isolated, and I’m giving myself a clean slate to get started with interface development again. 

Connecting with what I mentioned in the last bullet, I may start by creating a new window type, 'basic', which disregards the `workspace` parameters I had set out below in [the anatomy section](#anatomy-of-the-interface).


### Anatomy of the interface:

- `home`: where to select a project, and detached window for `index`
- `index`: a list of objects, classes, and workspaces in the project
    - accessible on the `home` page and as a drawer in `workspaces`
- `workspace`: a freeflow canvas for placing elements
    - object instances
        - detached cells with text, images, urls, etc
    - tables
        - class instances
        - other customized table views/class filters
- `hopper`: frictionless deposit box for new items

---


### General interface musings:

- I have an idea sketched out/in my mind for a new interface for configuring relation props, relying less on obscure language/iconography and more on physical analogies of drawing connections and wiring circuits
- Possible semantic elements
    - circles for classes, diamonds for properties, squares/rectangles for objects
- I’m imagining that this iteration of the interface will be much more stylistically pared back from my previous one, in consideration of the types of interfaces I’m most comfortable working in.
    - Possibly less lines
- Models/references:
    - IOS Stickies
- Instead of having string versus paragraph cells, maybe I can just have a text cell with an option to wrap or not    
- It would make sense / feel nice to me if sorting order isn't saved unless you explicitly save it, and if a sorting reset was easily identifiable/accessible
- In general my current thought is to implement Goby's more unconventional but conceptually important interface features, and otherwise make it as frictionless as possible, and then I can add on settings as I build which are more visually obscured but facillitate advanced usage/presentation modes
- I’m realizing the shift to the “workspace” model for windows clarifies a lot of things, in that by decoupling the styling from the styled class/object, I don't have to worry about things not being displayed, or being artificially constrained in their display. The data for any element is stored with minimal styling information, and then a user decides when, where, and how represent it visually, with that styling information tied to the workspace. 
    - An "index" drawer accessible through a button in the top-right corner of each page contains everything that exists in the database, and I'm thinking you could drag and drop stuff from it into a workspace.
    - This means you could conceivable have multiple instances of an element, for example different instances of a class each filtering its contents or representing it in a visually distinct manner.
    - on the development side, this means rather than looping through classes (as in the first iteration), a workspace will loop through each of the elements inside of it to place it.
- With the persistent "index" of items system, it'll have to be clear how and when an item is fully _deleted_ versus merely _stashed_, and still visible. My thought right now is that items will always delete by default on using the `DEL` key, with a contextmenu (right click) option to stash them, whereas classes will be the reverse (stashed by delete key, deleted with right click)

---

### Front-end development:

- It would be ideal to use the same UI elements for both the single select and the multiple select
- Right now I'm using a `store` value to record the currently “focused” UI element’s ID. But I’m anticipating in the future that there may be multiple focused items at a time, in that you may focus an element inside of the currently focused element (e.g. a search field inside of a dropdown). 
	- To address this, I think the `store` variable will need to be an array, and the unfocus function will need to check when another element is clicked/focused to see if it’s a descendant of any of the focused items in the array. If it’s not, those items need to be unfocused, and if so, then the most recently interacted-with element needs to be added to the array.
- I  discovered just now with some playing around in the tutorial that if you bind an undefined variable to a component prop that has defaults, the variable will take on the default value, which is surprising and will hopefully save me some mess.

Home page
- can use [recent documents list](https://www.electronjs.org/docs/latest/tutorial/recent-documents) native to mac and windows to remember what projects have already been opened
- OS [window customization](https://www.electronjs.org/docs/latest/tutorial/window-customization)


- opening URLs externally https://github.com/electron/electron/issues/1344#issuecomment-208839713


#### better-sqlite3 misadventures

`better-sqlite3` is tricky to combine with electron because it uses the native node installation on your operating system, but to work with Electron it actually needs to use Electron’s internal node version.

Step 1 in addressing that was re-compiling the node-module for Electron’s node version, which you do by following the steps [here](https://stackoverflow.com/a/52796884/11855303) using `electron-rebuild`. 

1. delete `node-modules` and `package-lock.json`
2. run `npm i`
3. run `./node_modules/.bin/electron-rebuild`

However, after resolving that, I started running into an issue with Electron crashing as soon as I ran any commands with `better-sqlite3`. This turned out to be [brand new bug](https://github.com/WiseLibs/better-sqlite3/issues/1044) as of writing this, and to fix it the maintainers recommended running

```
npm install
cd node_modules/better-sqlite3
npx node-gyp rebuild --debug --build-from-source --runtime=electron --target=26.1.0 --dist-url=https://electronjs.org/headers
cd ../..
npm run start
```

to manually rebuild the module binary, which seems to have worked for me.

This also meant that ultimately I couldn’t just use `npm link` to install the `goby-database` code. But instead of just copying it over (which I did last time, ensuing in all sorts of confusions and problems), I just went ahead and published the WIP to npm, and then installed it into the `goby-interface` repo.

**04/2025 update:** I had problems pop up with this again after my recent updates to the codebase; I moved to electron version 34.0.0, in which, it turns out, recompiling better-sqlite3 with electron-rebuild produces [a monstrous unhandled error](https://github.com/electron/rebuild/issues/1179) and fails. Resolving this is a little beyond me and I couldn’t find any user-documented solutions on github. 

Luckily I was at least able to get it running again by reverting to an older version of electron, 28.0.0, in which the rebuild finishes successfully. V28 is also the version in which they fixed the bug mentioned above, so no need to manually recompile anymore. 

I’m sure this is not the last time I’ll encounter this issue though — likely it’ll rear its ugly head again when I package the application for distribution.


---

### Ways forward:


- [ ] text object
    - [x] set up click event listener to add tentative text object at the clicked grid coordinate
    - [x] figure out how to wire up default item props with the `page_contents` variable
    - [x] set up validator upon exiting writing mode to see whether a new item should be added to the db (if it has no id and a length>0) or if an existing item has to be deleted (if it has an id and a length<0)
        - [x] set up functions in `goby-database`` to correspondingly add/remove items and set their values
        - [x] this should be called from `item` with a debouncer so it only updates the db when it's reasonably clear you're done typing
    - [x] set up `TextCell` component using `textarea`, with wrapping controls
        - [ ] set up hitting `shift`+`enter` or `esc` or clicking elsewhere to exit writing mode

- [ ] drag selection
    - [ ] detect when blocks/class rows are in the selection rectangle and add them to the selection
    - [ ] make the rectangle persistent if it doesn't encounter any blocks, and provide options to fill region with a text or image item
- [ ] contextmenu
    - [ ] set up event dispatcher signaling that an action has been clicked on in the menu
    - [ ] make it appear on the left side of the mouse if the menu would go over the page edge
- [ ] set up right-click "context menu" dialog with options to create a class or add an image
- [ ] set up class creation, which should involve placing the circle+line and giving the class a name (which is validated to make sure it’s unique)

- continue considering the mechanics of different interactions, particularly the creation and modification of relation properties


_*occasionally outdated/bypassed_
