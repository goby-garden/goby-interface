### Present to-do*:

- start setting up basic table and [window structure](https://www.are.na/block/23294643) using the [Authentic Sans](https://www.are.na/block/23282741) designs I’ve been working through, even if these are basically temporary/WIP
- start setting up the logic to store, represent and modify data with the Svelte `store` in communication with the back-end
- continue considering the mechanics of different interactions, particularly the creation and modification of relation properties


_*occasionally outdated/bypassed_

---


## Design:

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

## Development:

- It would be ideal to use the same UI elements for both the single select and the multiple select