<script lang="ts">
    import type { RelationItem } from "$lib/types";
    import {
        context,
        mission_control,
        client
    } from "$lib/workspace/workspace.svelte.js";
    import type { ClassData, Property } from "goby-database/dist/types";
    import CellWrapper from "../CellWrapper.svelte";
    import ItemOption from "./ItemOption.svelte";
    import EditField from "./EditField.svelte";
    import { untrack } from "svelte";

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

    let svelte_id = $props.id();

    let single = $derived(max_values == 1);

    let target_classes = $derived(
        context.workspace.classes.filter((c) =>
            property.relation_targets?.some((t) => t.class_id == c.id),
        ),
    );
    let target_labels = $derived(
        target_classes.reduce(
            (
                acc: {
                    [key: string]: string | undefined;
                },
                c,
            ) => {
                // TODO: this could probably be a util in the future
                // may also need to revisit if support is added for multi-prop labels etc
                // ADDENDUM: I can also probably make the output part of the store for the class prop in context.workspace instead of passing it down? unsure
                const label_prop_id = c.metadata.label?.properties[0];
                const label_prop = c.properties.find(
                    (p) => p.id == label_prop_id,
                );
                acc[c.id] = label_prop?.name;
                return acc;
            },
            {},
        ),
    );

    let select_field: HTMLElement | undefined = $state();

    function handle_click(e: MouseEvent) {
        if (select_field && e.target instanceof Node) {
            focused = select_field.contains(e.target);
        }
    }

    $effect(() => {
        // NOTE: generalize this!
        if (focused) {
            window.addEventListener("click", handle_click);
            untrack(()=>{
                client.open_modals.push(svelte_id);
            })
        } else {
            window.removeEventListener("click", handle_click);

            untrack(()=>{
                client.open_modals=client.open_modals.filter((a)=>a!==svelte_id);
            })
        }
    });

    function edit_selection(edit: {
        action: "add" | "remove";
        item: RelationItem;
    }) {

        let edits=[edit];

        if(edit.action=="add" && single){
            // if single select, remove currently selected item
            edits.push({
                action:'remove',
                item:value[0]
            })
        }
        
        window.requestAnimationFrame(() => {
            const mission_control_queue:Parameters<typeof mission_control["edit_relations"]>[0]=[];

            for(let { action,item,} of edits){
                // TODO: revise in future if I allow targets from the same class
                const corresponding_target = property.relation_targets?.find(
                    (target) => target.class_id == item.class_id,
                );
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

                mission_control_queue.push(
                    {
                        change: action,
                        sides: [
                            {
                                class_id: parent.class_id,
                                item_id: parent.item_id,
                                prop_id: property.id,
                            },
                            {
                                class_id: item.class_id,
                                item_id: item.system_id,
                                prop_id: corresponding_target?.prop_id || undefined,
                            },
                        ],
                    }
                )
    
                
            }

            mission_control.edit_relations(mission_control_queue);





        });
    }

    function selected_click_handler({ item }: { item: RelationItem }) {
        if (focused) {
            edit_selection({ action: "remove", item });
        }
    }

    let focused = $state(false);
    
    let base_hover=$state(false);

    let option_search_str=$state('');
    
    let base_hover_active=$derived(base_hover&&client.open_modals.length==0);

    function handle_passive_click(){
        if(!focused){
            // if(client.open_modals.length==0) focused=true;
        }else{
            focused=false;
        }
        
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
                        {item}
                        {single}
                        {target_labels}
                        click_handler={selected_click_handler}
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
                {target_classes}
                {property}
                selected={value}
                {edit_selection}
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
        gap:2px;
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
        width: calc(100% + 2* var(--field-offset));
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
        gap: 5px;
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
        height: fit-content;
        min-height: fit-content;
    }

    .select-field.single .select-value{
        /* z-index:5; */
    }

    .select-field.single.focused .select-value{
        pointer-events:none;
        opacity:0.5;
    }

    .select-field.single.focused.searching .select-value{
        opacity:0;
    }

    .select-field.single .edit-field-wrapper{
        margin-top: 0px;
    }

    .select-field.single .select-value{
        grid-area:edit;
    }

    
</style>
