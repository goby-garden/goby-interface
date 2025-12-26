<script lang="ts">
    // type imports
    import type { RelationItem,NewItem,SelectionEdit } from "$lib/types";
    import type { ClassData, Property } from "goby-database/dist/types";
    
    // global store imports
    import {
        context,
        mission_control,
        client
    } from "$lib/workspace/workspace.svelte.js";
    
    // utils
    import { untrack } from "svelte";
    import { defined } from "goby-database/dist/utils";

    // component imports
    import CellWrapper from "../CellWrapper.svelte";
    import ItemOption from "./ItemOption.svelte";
    import EditField from "./EditField.svelte";

    // component params
    let {
        value = $bindable([]),
        max_values,
        property,
        parent,
    }: {
        value: RelationItem[];
        max_values: number | null;
        property: Property;
        parent: { block_id: number; class_id: number; item_id: number };
    } = $props();

    // unique ID for component instance
    let svelte_id = $props.id();

    // reactive variables/bindings --------------------------
    
    // option search input
    let select_field: HTMLElement | undefined = $state();

    // search input value
    let option_search_str=$state('');

    // is selection dropdown focused (does not map directly to input)
    let focused = $state(false);
    
    // is the cell (but not any of the selected options) being hovered
    let base_hover=$state(false);

    // list of newly created items which are not yet saved to database
    let new_item_queue:NewItem[]=$state([]);

    // when new items are created, the list of selection options needs to be refreshed
    let queue_option_update:boolean=$state(false);

    
    // derived variables --------------------------
    
    // is it a single-select?
    let single = $derived(max_values == 1);

    // fetches class data for each target and combines them into single objects for easy access
    let targets_with_class_data=$derived.by(()=>{
        const combined=(property.relation_targets || []).map((target)=>{
            const class_data=context.workspace.classes.find((t) => t.id == target.class_id);
            return {
                class_data,
                ...target
            }
        });

        const validated=combined.filter((target)=>defined(target.class_data)) as Array<typeof combined[number] & {class_data:ClassData}>;

        return validated;
    })

    // compiles the label properties for each target class into a keyed object for easy access
    let target_labels = $derived(
        targets_with_class_data.reduce(
            (
                acc: {
                    [key: string]: string | undefined;
                },
                c,
            ) => {
                // TODO: this could probably be a util in the future
                // may also need to revisit if support is added for multi-prop labels etc
                // ADDENDUM: I can also probably make the output part of the store for the class prop in context.workspace instead of passing it down? unsure
                const label_prop_id = c.class_data.metadata.label?.properties[0];
                const label_prop = c.class_data.properties.find(
                    (p) => p.id == label_prop_id,
                );
                acc[c.class_id] = label_prop?.name;
                return acc;
            },
            {},
        ),
    );

    


    // effects --------------------------------
    

    // when focused, add click listener to handle clicking out to unfocus
    $effect(() => {
        // NOTE: generalize this into an action or wrapper component, probably?
        if (focused) {
            window.addEventListener("click", handle_click);
            untrack(()=>{
                client.open_modals.push(svelte_id);
            })
        } else {
            window.removeEventListener("click", handle_click);

            if(new_item_queue.length>0){
                // when focus ends, create any new items in queue
                edit_selection_batch(
                    $state.snapshot(new_item_queue).map((item)=>({
                        action:'add',
                        item
                    })),
                    ()=>{
                        new_item_queue=[];
                    }
                );

                // set options to be refreshed the next time this dropdown is opened
                queue_option_update=true;
            }

            untrack(()=>{
                client.open_modals=client.open_modals.filter((a)=>a!==svelte_id);
            })
        }
    });    

    // utils and event handlers ----------------------------------

    /**
     * unfocus if click is outside bounds of cell
     * @param e
     */
    function handle_click(e: MouseEvent) {
        if (select_field && e.target instanceof Node) {
            focused = select_field.contains(e.target);
        }
    }


    /**
     * add or remove a single item from the selection, and save to database
     * @param edit
     */
    function edit_selection(edit: {action:'add' | 'remove', item:RelationItem}) {

        let edits:SelectionEdit[]=[edit];

        if(edit.action=="add"){
            // if single select, remove currently selected item
            single_select_clear();
        }

        edit_selection_batch(edits);
    }

    /**
     * make a batch of changes to the selection, and save to database
     * @param edits
     * @param finished_callback - fires when edits have been finished asynchronously, to synchronize other changes to the DOM
     */
    function edit_selection_batch(edits:SelectionEdit[],finished_callback?:()=>void){
        
        window.requestAnimationFrame(async () => {
            for(let {action,item} of edits){
                // make changes client-side if items already exist
                if("system_id" in item){
                    if (action == "add") {
                        value = [...(value || []), item];
                    } else if (action == "remove") {
                        value = (value || []).filter(
                            (sel) =>
                                !(
                                    sel.class_id == item.class_id &&
                                    sel.system_id == item.system_id
                                ),
                        );
                    }
                }
            }

            const mission_control_queue:Parameters<typeof mission_control["edit_relations"]>[0]=[];

            const input_1={
                class_id: parent.class_id,
                item_id: parent.item_id,
                prop_id: property.id,
            }
                
            for(let { action,item,} of edits){

                // temporary; this is here because the options array does not have prop IDs
                // because I have not yet added handling for when a property targets two props from the same class
                const corresponding_target = property.relation_targets?.find(
                    (target) => target.class_id == item.class_id,
                );


                let input_2="system_id" in item?{
                    class_id:item.class_id,
                    prop_id:item.prop_id ?? corresponding_target?.prop_id ?? undefined,
                    item_id:item.system_id
                }:item;

                mission_control_queue.push(
                    {
                        change: action,
                        sides: [
                            input_1,
                            input_2
                        ],
                    }
                )
    
                
            }

            await mission_control.edit_relations(mission_control_queue);
            if(finished_callback) finished_callback();

        });
    }

    /**
     * click handler to remove item from selection
     */
    function selected_click_handler({ item }: { item: RelationItem }) {
        if (focused) {
            edit_selection({ action: "remove", item });
        }
    }

    
    // should probably consolidate this in the future with my other click-out handler
    function handle_passive_click(){
        if(focused){
            focused=false;
        }
    }

    /**
     * Event handler for when you click to create a new item with a specified class
     * @param param0
     */
    function handle_create_new({class_id,prop_id}:{class_id:number,prop_id?:number | null}){
        
        const new_item:NewItem={
            class_id,
            label:option_search_str
        }

        if(defined(prop_id)){
            new_item.prop_id=prop_id;
        }

        // clear other items if single select
        single_select_clear();

        // new_item_queue
        
        new_item_queue.push(new_item);

        requestAnimationFrame(()=>{
            option_search_str='';
        })
        
    }


    function single_select_clear(){
        if(single){
            // remove any registered item
            if(value?.length>0){
                edit_selection_batch([{
                    action:'remove',
                    item:value[0]
                }]);
            }
    
            //remove any new item 
            new_item_queue=[];
        }
    }

    /**
     * Click handler to remove a new item that has not been registered yet
     * @param param0
     */
    function remove_new_from_queue({label,class_id,prop_id}:{e:MouseEvent,label:string,class_id:number,prop_id?:number}){
        requestAnimationFrame(()=>{
            new_item_queue=new_item_queue.filter((item)=>{
                let is_matching=item.label==label&&
                                item.class_id==class_id&&
                                item.prop_id==prop_id;
                return !is_matching;
            })
        })
    }

</script>

<CellWrapper fill_height>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        class="select-field" 
        class:single
        class:focused bind:this={select_field} 
        class:searching={option_search_str.length>0}
        class:base-hover={base_hover}
        onmouseenter={()=>base_hover=true}
        onmouseleave={()=>base_hover=false}
        >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="detect-base-hover"
            onclick={handle_passive_click}
            
        >
        </div>
        <ul class="select-value display">
            {#each value as item,i (item.system_id)}
                <!-- <div class="spacer">
                    <div class="insert-bar"></div>
                </div> -->
                <li class="selection">
                    <ItemOption
                        registered
                        {item}
                        {single}
                        {target_labels}
                        click_handler={selected_click_handler}
                    />
                </li>
            {/each}
            {#each new_item_queue as {label,class_id,prop_id},i (`${label}-${class_id}`)}
                <li class="selection">
                    <ItemOption
                        registered={false}
                        {single}
                        {label}
                        {class_id}
                        {prop_id}
                        click_handler={remove_new_from_queue}
                    />
                </li>
            {/each}
        </ul>
        <div class="edit-highlight"></div>
        <div class="edit-field-wrapper">
            <EditField
                bind:focused
                bind:option_search_str
                hover={base_hover}
                {target_labels}
                targets={targets_with_class_data}
                {property}
                {single}
                selected={value || []}
                {edit_selection}
                {handle_create_new}
                bind:queue_option_update
            />
        </div>
    </div>
</CellWrapper>

<style>
    .select-field {
        min-height:100%;
        width: 100%;
        position: relative;
        --field-offset:8px;
        display:grid;
        grid-template-rows: min-content min-content;
        grid-template-areas:'value'
                            'edit';
        gap:4px;
        
        --option-gap:8px;
    }

    .select-value{
        grid-area:value;
    }

    .edit-field-wrapper,
    .edit-highlight{
        grid-area:edit;
    }

    .edit-highlight{
        z-index:1;
        margin-left: calc(var(--field-offset) * -1);
        width: calc(100% + var(--field-offset));
    }

    .focused .edit-highlight{
        background-color:#F5F5F5;
    }

    .detect-base-hover{
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
        pointer-events:all;
    }

    .base-hover .detect-base-hover{
        /* cursor:pointer; */
    }

    ul {
        display: flex;
        flex-flow: column nowrap;
        gap: var(--option-gap);
        line-height: 1.3em;
        position: relative;
        z-index: 3;
        pointer-events:none;
    }

    li{
        position:relative;
        z-index:10;
        width:fit-content;
        pointer-events:all;

        &::before{
            content:'';
            width:100%;
            position:absolute;
            z-index:1;
            top:-5px;
            height:calc(100% + 10px);
        }
    }

    .spacer{
        z-index:5;
        pointer-events:all;
        position:relative;
        /* cursor:pointer; */
        height:5px;
        width:100%;
        margin-left:calc(-1 * var(--field-offset));
    }

    
    .spacer::before{
        content:'';
        height:27px;
        transform:translateY(-50%);
        position:absolute;
        top:0;
        left:0;
        width:100%;
    }

    .spacer .insert-bar::before{
        /* background-color:gray; */
        border-inline:4px solid white;
        width:4px;
        height:4px;
        display:block;
        content:'';
        left:4px;
        position:relative;
    }


    .spacer .insert-bar{
        top:50%;
        position:absolute;
        left:0;
        width:100%;
        height:4px;
        transform:translateY(-50%);
        opacity:0;
        /* background-color:#F5F5F5; */
        /* transition:background-color 0.1s; */
    }

    .spacer:hover .insert-bar{
        background-color:#F5F5F5;
       opacity:1;
    }

    .spacer:first-of-type{
        height:0px;
        & .insert-bar{
            top:0px;
            /* transform:translateY(-50%);
            top:-2px; */
        }
    }



    .focus-edit-field {
        z-index: 1;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .edit-field-wrapper {
        position: relative;
        z-index: 3;
        pointer-events:all;
    }

    .focused .edit-field-wrapper {
        z-index: 20;
    }

    .select-field.single{
        display:grid;
        grid-template-areas:'edit';
        grid-template-rows: min-content;
        /* height: fit-content;
        min-height: fit-content; */
    }

    .select-field.single .select-value{
        /* z-index:5; */
        /* padding-right:22px; */
    }

    .select-field.single.focused .select-value{
        pointer-events:none;
        opacity:0.7;
    }
    

    .select-field.single.focused.searching .select-value{
        opacity:0;
    }

    .select-field.single .edit-field-wrapper,
    .select-field.single .edit-highlight{
        margin-top: -2.5px;
    }

    .select-field.single .select-value{
        grid-area:edit;
    }

    
</style>
