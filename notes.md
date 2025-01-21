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
- `dropper`: frictionless deposit box for new items

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
