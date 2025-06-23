import type Project from "goby-database";

type FocusElement = {
    block_id: number,
    svelte_id: string,
    class_id?: number,
    item_id?: number,
    prop_id?: number,
}

export let context: {
    focus_element:FocusElement | null ,
    workspace:ReturnType<Project["retrieve_workspace_contents"]>
}= $state({
    focus_element:null,
    workspace:{blocks:[],items:[],classes:[]}
});

// :ReturnType<Project["retrieve_workspace_contents"]>=$state({blocks:[],items:[],classes:[]})

export function match_focus_element(
    compare: {
        block_id?: number,
        svelte_id?: string,
        class_id?: number,
        item_id?: number,
        prop_id?: number,
    },
    focus?: FocusElement | null
) {
    focus = focus ?? context.focus_element

    const entries = Object.entries(compare) as [
        "block_id" | "svelte_id" | "class_id" | "item_id" | "prop_id",
        number | string
    ][]

    let matching = focus !== undefined && focus !== null && entries.length > 0;
    if (focus) {
        for (const [key, value] of entries) {
            if (focus[key] !== value) matching = false;
        }
    }

    return matching;

}