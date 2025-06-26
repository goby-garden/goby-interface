<script lang="ts">
    import {context} from '$lib/workspace/store.svelte';
    import type { ClassData, Property } from "goby-database/dist/types";
    import CellWrapper from "./CellWrapper.svelte";
    
    let {
        value,
        max_values,
        property
    }:{
       value:{
        class_id:number,
        item_id:number,
        // used for label
        [key:string]:any,
       }[],
       max_values:number | null,
       property:Property
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

<CellWrapper>
    <ul class="select-value display" class:multiple>
        {#each value as item}
            {@const label_prop=target_labels[item.class_id]}
            {@const label = label_prop ? item[`user_${label_prop}`] : null}
            <!-- {@const targetClass=context.workspace.classes.find((c)=>c.id ==item.class_id)} -->
            <li class='selection'>{label}</li>
        {/each}
    </ul>
    <!-- {#each value as item}

    {/each} -->
</CellWrapper>


<style>
    ul{
        display:flex;
        flex-flow:column nowrap;
        gap:5px;
        line-height:1.3em;
    }
    .selection::before{
        content:'';
        height:4px;
        width:4px;
        vertical-align:middle;
        margin-right:4px;
        background-color:rgba(255, 0, 0, 0.484);
        display:inline-block;
        transform:translateY(-1px);
    }
</style>