<script lang="ts">
    import {context} from '$lib/workspace/store.svelte';
    import CellWrapper from "../CellWrapper.svelte";
    let {
        value = $bindable(),
        wrap = false,
        parent
    }:{
        value:string,
        parent:{block_id:number,class_id:number,item_id:number}
        wrap?:boolean
    } = $props();

    const svelte_id=$props.id();

    let textEditor:HTMLDivElement;

    let focused=$state(false);

    function handle_keydown(e:KeyboardEvent){
        if(e.key=='Escape'){
            textEditor.blur();
        }
    }
    
</script>

<CellWrapper >
    <!-- contenteditable='plaintext-only' -->
     <div class="text-value-outer" class:wrap class:focused>
        <div 
            role="textbox"
            tabindex="0"
            class="text-value edit" 
            bind:innerText={value}
            bind:this={textEditor}
            onfocus={()=>focused=true}
            onblur={()=>focused=false}
            onkeydown={handle_keydown}
            contenteditable='plaintext-only'
            ></div>
        <div class="text-value display">{value}</div>
     </div>
</CellWrapper>


<style>
    .text-value-outer{
        display:grid;
        grid-template-areas:"main";
        line-height:1.3em;
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

