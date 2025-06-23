<script lang="ts">
    import type { Property } from "goby-database/dist/types";
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

    // $inspect('value',value,'max_values',max_values)
</script>

<CellWrapper>
    <div class="select-value display" class:multiple>
        {#each value as item}
            <div class='selection'></div>
        {/each}
    </div>
    <!-- {#each value as item}

    {/each} -->
</CellWrapper>