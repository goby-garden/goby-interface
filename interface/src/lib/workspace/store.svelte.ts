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

