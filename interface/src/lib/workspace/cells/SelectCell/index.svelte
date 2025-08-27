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
        property,
        focused = $bindable(false),
    }:{
       value:RelationItem[],
       max_values:number | null,
       property:Property,
       focused?:boolean
    } = $props();

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

    $inspect('target_labels',target_labels)

    // $inspect('value',value,'max_values',max_values)
</script>

<CellWrapper fill_height>
    <div class="select-field">
        <ul class="select-value display" class:multiple class:focused>
        {#each value as item}
                <li class='selection'>
                    <ItemOption {item} {target_labels} />
                </li>
            {/each}
        </ul>
        <div class="edit-field-wrapper" class:focused>
            <EditField {focused} />
        </div>
    </div>
    
   
</CellWrapper>


<style>
    .select-field{
        min-height:100%;
        width:100%;
    }
    ul{
        display:flex;
        flex-flow:column nowrap;
        gap:5px;
        line-height:1.3em;
    }

    .edit-field-wrapper{
        margin-top:2px;
        opacity:0;
        transition:opacity 0.3s;
    }

    .edit-field-wrapper.focused{
        opacity:1;
    }
</style>