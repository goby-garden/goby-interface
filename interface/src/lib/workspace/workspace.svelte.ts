import { instance } from '$lib/index.svelte.js';
import type Project from "goby-database";
import { defined } from 'goby-database/dist/utils';
import type { ClassRow, ItemRelationSide, Property } from 'goby-database/dist/types';
import type { RelationItem,ItemRefreshQueue} from '$lib/types';

/**
 * Global reactive state containing all the project data that is currently loaded into this workspace
 */
export let context: {
    workspace: ReturnType<Project["retrieve_workspace_contents"]>
} = $state({
    workspace: { blocks: [], items: [], classes: [] }
});

/**
 * Global reactive state of client-side UI attributes
 */
export const client: {
    open_modals: string[]
} = $state({
    open_modals: []
})

type Pr<T> = Promise<T | undefined>

/**
 * Contains functions to communicate with the database and propagate changes
 */
export const mission_control = {
    get_workspace: async () => {
        return await instance.electron?.get_workspace();
    },
    get_relation_options: async (property: Property): Pr<RelationItem[]> => {
        if (!instance.electron) return;

        let options: RelationItem[] = [];

        // NOTE: this should cache more effectively in the future,
        // and to that end be moved to the frontend so that it can save the items for each class
        for (const { class_id, prop_id } of property.relation_targets ?? []) {

            const conditions = [];

            if (prop_id) {
                // if this relation is two-sided,
                // filter results by options which can accept more relations for their property
                conditions.push({
                    name: "under_property_max" as "under_property_max",
                    property_id: prop_id
                })
            }

            const retrieved_item_data = await instance.electron.retrieve_class_items({
                class_id,
                pagination: {
                    property_range: 'slim',
                    conditions
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
    edit_relations: async (relations: Parameters<Project["action_edit_relations"]>[0]) => {
        if (!instance.electron) return;
        const class_edit_records = await instance.electron.edit_relations(relations);

        // surgically reload items that have been edited or created
        handle_item_refresh(class_edit_records);
        

        return;
    },
    edit_item_data: async (...[class_id, item_id, changes]:Parameters<Project["action_edit_item_data"]>) => {
        if (!instance.electron) return;
        await instance.electron.edit_item_data(class_id,item_id,changes);

        const refresh_queue:ItemRefreshQueue={}

        const class_data=context.workspace.classes.find((cls)=>cls.id==class_id);
        if(defined(class_data)){
            // go through each change:
            for(let change of changes){
                // check if the edited property is a label. if so:
                if(class_data.metadata.label?.properties.includes(change.property_id)){
                    // go through each loaded class:
                    for(let {items,properties,id} of context.workspace.classes){

                        // check if it has properties that reference this class. 
                        const relevant_props=properties.filter((prop)=>{
                            return prop.type=='relation'&&prop.relation_targets.some((target)=>target.class_id==class_id);
                        })

                        // if so:
                        if(relevant_props.length>0){
                            // add those properties to the refresh queue
                            const refresh_queue_obj=refresh_queue[id] ?? {
                                modified_items:[],
                                modified_properties:[...relevant_props.map((prop)=>prop.id)],
                                created_items:[]
                            }

                            // go through each item:
                            for(let item of items.loaded){
                                for(let prop of relevant_props){
                                    const v:RelationItem[]=item[`user_${prop.name}`] ?? [];
                                    // check if it references the edited item
                                    const needs_refresh=Array.isArray(v)&&v.some((selection)=>selection.system_id==item_id);
                                    if(needs_refresh){
                                        // if so, add it to the refresh queue
                                        refresh_queue_obj.modified_items.push(item.system_id);
                                    }
                                }
                            }

                            refresh_queue[id]=refresh_queue_obj;
                        }
                        
                    }
                }

            }

            // send all changes to be refreshed
            handle_item_refresh(refresh_queue);
        }else{
            console.log('Error: could not find class corresponding to this edit')
        }



    }
}

/**
 * Surgically reload and merge new data for items that have been updated in the database
 * @param refresh_queue 
 * @returns 
 */
async function handle_item_refresh(refresh_queue:ItemRefreshQueue){
    if (!instance.electron) return;

    // for each of the classes loaded in, 
        for (let cls of context.workspace.classes) {

            const edit_record = refresh_queue[`${cls.id}`];

            if (!defined(edit_record)) continue;

            // if there are new items:
            // - add them to the item range
            // - fetch all the properties instead of the range specified
            // when merging, push the new item to cls.items.loaded at the appropriate position, based on system_order
            const all_items = [
                // no need to fetch modified items if they are not in the currently paginated set
                ...edit_record.modified_items.filter((id) => cls.items.loaded.some((item) => item.system_id == id)),
                ...edit_record.created_items
            ]

            if (all_items.length > 0) {
                console.log('refreshing items', all_items)
                // fetch the data that needs to be refreshed 
                console.log('refresh_queue.props', edit_record.modified_properties);
                const refreshed = await instance.electron.retrieve_class_items({
                    class_id: cls.id,
                    pagination: {
                        // if new items, fetch all the properties instead of just the modified ones
                        property_range: edit_record.created_items.length > 0 ? "all" : edit_record.modified_properties,
                        item_range: all_items
                    }
                })

                // merge new data with currently loaded items
                for (let item of refreshed.loaded) {
                    const current_index = cls.items.loaded.findIndex((a) => a.system_id == item.system_id);
                    if (current_index >= 0) {
                        cls.items.loaded[current_index] = {
                            ...cls.items.loaded[current_index],
                            ...item
                        }
                    } else if (edit_record.created_items.includes(item.system_id)) {

                        // TODO: when I have real pagination, and/or filtering/sorting rules,
                        // this will not work and I will need to revisit the approach
                        if (!defined(cls.items.page_size)) {

                            // find where in system_order this goes, and add it there
                            const is_last = item.system_order > cls.items.loaded.at(-1)?.system_order;

                            let insert_index = is_last ? cls.items.loaded.length : cls.items.loaded.findIndex((existing, i) => {
                                return (existing.system_order > item.system_order);
                            });

                            cls.items.loaded = cls.items.loaded.toSpliced(insert_index, 0, item);

                        }
                    }
                }

            }
        }
}