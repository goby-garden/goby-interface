<script lang="ts">
    import {state} from '$lib/workspace/store.svelte';
    import CellWrapper from "./CellWrapper.svelte";
    let {
        value = $bindable(),
        focused = $bindable(false),
        wrap = false,
    }:{
        value:string,
        focused?:boolean,
        wrap?:boolean
    } = $props();

    const element_id=$props.id();

    $effect(()=>{
        if(focused){
            state.focus_element=element_id;
        }else if(state.focus_element==element_id){
            state.focus_element=null;
        }
    })
</script>

<CellWrapper data_type="string" >
    <!-- contenteditable='plaintext-only' -->
     <div class="text-value-outer" class:wrap class:focused>
        <div 
        class="text-value edit" 
        bind:innerText={value}
        onfocus={()=>focused=true}
        onblur={()=>focused=false}
        contenteditable='plaintext-only'
        ></div>
        <div class="text-value display">{value}</div>
     </div>
</CellWrapper>


<style>
    .text-value-outer{
        display:grid;
        grid-template-areas:"main";
    }

    .text-value{
        grid-area:main;
    }

    .text-value.edit{
        opacity:0;
    }

    .text-value.edit:focus-visible{
        outline:none;
    }

    .focused .text-value.edit{
        opacity:1;
    }

    .text-value.display{
        pointer-events:none;
    }

    .focused .text-value.display{
        opacity:0;
    }


    .text-value-outer:not(.wrap){
        white-space:nowrap;
    }
</style>

