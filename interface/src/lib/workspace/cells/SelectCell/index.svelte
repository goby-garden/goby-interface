<script lang="ts">
    import type {RelationItem} from './types';
    import {context} from '$lib/workspace/store.svelte';
    import type { ClassData, Property } from "goby-database/dist/types";
    import CellWrapper from "../CellWrapper.svelte";
    import ItemOption from './ItemOption.svelte';
    import EditField from './EditField.svelte';
     
    let {
        value,
        max_values,
        property
    }:{
       value:RelationItem[],
       max_values:number | null,
       property:Property,
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



    let focused=$state(false);

    // $inspect('value',value,'max_values',max_values)
</script>

<CellWrapper fill_height>
    <div class="select-field" class:focused bind:this={select_field}>
        <button class="focus-edit-field" aria-label="Edit select field" onclick={()=>focused=true}></button>
        <ul class="select-value display" class:multiple>
        {#each value as item}
                <li class='selection'>
                    <ItemOption {item} {target_labels} />
                </li>
            {/each}
        </ul>
        <div class="edit-field-wrapper">
            <EditField bind:focused />
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
        background-color:var(--col-light-bg);
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