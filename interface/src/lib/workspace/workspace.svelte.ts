import { instance } from '$lib/index.svelte.js';
import type Project from "goby-database";
import {defined} from 'goby-database/dist/utils';
import type { ClassRow, ItemRelationSide, Property } from 'goby-database/dist/types';
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

        // for each of the classes loaded in, 
        for(let cls of context.workspace.classes){
            const refresh_queue:{
                props:number[],
                items:number[]
            }={
                props:[],
                items:[]
            }

            // conclude which items and properties need to be refreshed
            for(let {sides} of relations){
                // see if they match any sides and have a property specified
                const matching=sides.filter((side)=>defined(side.prop_id)&&side.class_id==cls.id) as (ItemRelationSide & {prop_id:number})[]
                // as this means they need to be refreshed

                for(let side of matching){
                    // add the prop that was edited
                    if(!refresh_queue.props.includes(side.prop_id)){
                        console.log(`adding ${cls.id} prop ${side.prop_id} to refresh queue`)
                        refresh_queue.props.push(side.prop_id);
                    }
                    
                    // add the item that has been edited
                    if(
                        // no need to reload if the item isn’t already loaded in
                        cls.items.loaded.some((item)=>item.system_id==side.item_id)
                        && !refresh_queue.items.includes(side.item_id)
                    ){
                        console.log(`adding ${cls.id} item ${side.item_id} to refresh queue`)
                        refresh_queue.items.push(side.item_id);
                    }
                }
            }

            if(refresh_queue.items.length>0){
                console.log('refreshing items',refresh_queue.items)
                // fetch the data that needs to be refreshed 
                console.log('refresh_queue.props',refresh_queue.props);
                const refreshed=await instance.electron.retrieve_class_items({
                    class_id:cls.id,
                    pagination:{
                        property_range:refresh_queue.props,
                        item_range:refresh_queue.items
                    }
                })

                // merge new data with currently loaded items
                for(let item of refreshed.loaded){
                    const current_index=cls.items.loaded.findIndex((a)=>a.system_id==item.system_id);
                    if(current_index>=0){
                        cls.items.loaded[current_index]={
                            ...cls.items.loaded[current_index],
                            ...item
                        }
                    }
                }
                
            }

            


        }

        // for(let {sides} of relations){
        //     sides.forEach((side,s)=>{
        //         // for each of the classes loaded in, see if they match the side
        //         // if they do and they have a property specified, they need to be refreshed
        //         // two ways to narrow down the refresh, if I so choose:
        //         // - only fetch the IDs of the items which have been edited
        //         // - only fetch the properties which have been affected
        //     })
        // }

        
    }
}