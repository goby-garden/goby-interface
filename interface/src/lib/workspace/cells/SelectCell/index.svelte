<script lang="ts">
    import type {RelationItem} from './types';
    import { instance } from '$lib/index.svelte.js';
    import {context} from '$lib/workspace/store.svelte';
    import type { ClassData, Property } from "goby-database/dist/types";
    import CellWrapper from "../CellWrapper.svelte";
    import ItemOption from './ItemOption.svelte';
    import EditField from './EditField.svelte';
     
    let {
        value = $bindable([]),
        max_values,
        property,
        parent
    }:{
       value:RelationItem[],
       max_values:number | null,
       property:Property,
       parent:{block_id:number,class_id:number,item_id:number}
    } = $props();

    let svelte_id=$props.id();

    const multiple = max_values==null || max_values>1;

    let target_classes=$derived(context.workspace.classes.filter((c)=>property.relation_targets?.some((t)=>t.class_id==c.id)));
    let target_labels=$derived(target_classes.reduce((acc:{
        [key:string]:string | undefined
    },c
    )=>{
        // TODO: this could probably be a util in the future
        // may also need to revisit if support is added for multi-prop labels etc
           // ADDENDUM: I can also probably make the output part of the store for the class prop in context.workspace instead of passing it down? unsure
        const label_prop_id=c.metadata.label?.properties[0];
        const label_prop=c.properties.find((p)=>p.id==label_prop_id);
        acc[c.id]=label_prop?.name;
        return acc;
    },{}))


    let select_field:HTMLElement | undefined=$state();

    function handle_click(e:MouseEvent){
        if(select_field&&e.target instanceof Node){
            focused=select_field.contains(e.target);
        }
    }

    $effect(()=>{
        // NOTE: generalize this!
        if(focused){
            window.addEventListener('click',handle_click)
        }else{
            window.removeEventListener('click',handle_click)
        }
    })


    function edit_selection({
        action,
        item
    }:{
        action:'add' | 'remove',
        item:RelationItem
    }){
        window.requestAnimationFrame(()=>{
            if(action=='add'){                
                value=[
                    ...(value || []),
                    item
                ]
                
                // TODO: revise in future if I allow targets from the same class
                const corresponding_target=property.relation_targets?.find((target)=>target.class_id==item.class_id);

                if(instance.electron){
                    instance.electron.make_relations([
                        [
                            {
                                class_id:parent.class_id,
                                item_id:parent.item_id,
                                prop_id:property.id,
                            },
                            {
                                class_id:item.class_id,
                                item_id:item.system_id,
                                prop_id:corresponding_target?.prop_id || undefined
                            }
                        ]
                    ])
                }
            }else if(action=='remove'){
                value=(value || []).filter((sel)=>!(sel.class_id==item.class_id && sel.system_id==item.system_id));
            }
        })
    }

    function selected_click_handler({item}:{item:RelationItem}){
        if(focused){
            edit_selection({action:'remove',item});
        }
    }

    let focused=$state(false);
</script>

<CellWrapper fill_height>
    <div class="select-field" class:focused bind:this={select_field}>
        <ul class="select-value display" class:multiple>
         {#each value as item}
                <li class='selection'>
                    <ItemOption {item} {target_labels} click_handler={selected_click_handler} />
                </li>
            {/each}
        </ul>
        <div class="edit-field-wrapper">
            <EditField bind:focused {target_labels} {target_classes} {property} selected={value} {edit_selection} />
        </div>
    </div>
    
   
</CellWrapper>


<style>
    .select-field{
        /* min-height:100%; */
        width:100%;
        position:relative;
        
    }

    
   

    ul{
        display:flex;
        flex-flow:column nowrap;
        gap:5px;
        line-height:1.3em;
        position:relative;
        z-index:3;
        pointer-events:none;
    }

    ul{
        /* transition:background-color 0.3s; */
        
    }

    /* .select-field:has(.focus-edit-field:hover) ul, */
    /* .select-field:has(.edit-field-wrapper:hover) ul, */
    .select-field.focused ul{
        /* transition-delay:0.1s; */
        /* background-color:var(--col-light-bg); */
    }


    .focus-edit-field{
        z-index:1;
        position:absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
    }

    .edit-field-wrapper{
        position:relative;
        z-index:3;
        margin-top:2px;
        opacity:0;
        /* transition:opacity 0.3s; */
        
    }

    .focused .edit-field-wrapper{
        z-index:20;
    }



     .focused .edit-field-wrapper,
     /* .select-field:has(.focus-edit-field:hover) .edit-field-wrapper, */
     .edit-field-wrapper:hover{
        opacity:1;
    }
</style>