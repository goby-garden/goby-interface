### Present to-do*:

- start setting up basic table and [window structure](https://www.are.na/block/23294643) using the [Authentic Sans](https://www.are.na/block/23282741) designs I’ve been working through, even if these are basically temporary/WIP
- start setting up the logic to store, represent and modify data with the Svelte `store` in communication with the back-end
- continue considering the mechanics of different interactions, particularly the creation and modification of relation properties


_*occasionally outdated/bypassed_

---


### Design:

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

---

### Development:

- It would be ideal to use the same UI elements for both the single select and the multiple select


Home page
- can use [recent documents list](https://www.electronjs.org/docs/latest/tutorial/recent-documents) native to mac and windows to remember what projects have already been opened
- OS [window customization](https://www.electronjs.org/docs/latest/tutorial/window-customization)



## better-sqlite3 misadventures

`better-sqlite3` is tricky to combine with electron because it uses the native node installation on your operating system, but to work with Electron it actually needs to use Electron’s internal node version. That means ultimately I can

Step 1 in addressing that was re-compiling the node-module for Electron’s node version, which you do by following the steps [here](https://stackoverflow.com/a/52796884/11855303) using `electron-rebuild`. 

1. delete `node-modules` and `package-lock.json`
2. run `npm i`
3. run `./node_modules/.bin/electron-rebuild`

However, after resolving that, I started running into an issue with Electron crashing as soon as I ran any commands with `better-sqlite3`. This turned out to be [brand new bug](https://github.com/WiseLibs/better-sqlite3/issues/1044) as of writing this, and to fix it the maintainers recommended running

This also meant that ultimately I couldn’t just use `npm link` to install the `goby-database` code. But instead of just copying it over (which I did last time, ensuing in all sorts of confusions and problems), I just went ahead and published the WIP to npm, and then installed it into the `goby-interface` repo.

```
npm install
cd node_modules/better-sqlite3
npx node-gyp rebuild --debug --build-from-source --runtime=electron --target=26.1.0 --dist-url=https://electronjs.org/headers
cd ../..
npm run start
```

to manually rebuild the module binary, which seems to have worked for me.



```
npm install
cd node_modules/better-sqlite3
npx node-gyp rebuild --debug --build-from-source --runtime=electron --target=26.1.0 --dist-url=https://electronjs.org/headers
cd ../..
npm run start
```