import { instance } from '$lib/index.svelte.js';
import type Project from "goby-database";
import type { ClassRow, Property } from 'goby-database/dist/types';
import type { RelationItem } from '$lib/types';

export let context: {
    workspace: ReturnType<Project["retrieve_workspace_contents"]>
} = $state({
    workspace: { blocks: [], items: [], classes: [] }
});

type Pr<T> = Promise< T | undefined>

export const mission_control={
    get_workspace:async ()=>{
        return await instance.electron?.get_workspace();
    },
    get_relation_options:async (property: Property):Pr<RelationItem[]>=>{
        if(!instance.electron) return;

        let options: RelationItem[] = [];

        // NOTE: this should cache more effectively in the future,
        // and to that end be moved to the frontend so that it can save the items for each class
        for (const { class_id } of property.relation_targets ?? []) {
            const retrieved_item_data = await instance.electron.retrieve_class_items({
                class_id,
                pagination: {
                    property_range: 'slim'
                }
            })

            const class_items: RelationItem[] = retrieved_item_data.loaded.map((item) => ({
                ...item,
                class_id
            }))

            options = [...options, ...class_items]
        }
        return options;
    },
    edit_relations:async (relations:Parameters<Project["action_edit_relations"]>[0])=>{
        if(!instance.electron) return;
        await instance.electron.edit_relations(relations);

        // here is where I need to add logic refreshing the items in context.workspace
        // that are affected by the relation changes
        // (using retrieve_class_items)
    }
}