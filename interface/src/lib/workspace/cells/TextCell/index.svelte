<script lang="ts">
    import {context,match_focus_element} from '$lib/workspace/store.svelte';
    import CellWrapper from "../CellWrapper.svelte";
    let {
        value = $bindable(),
        focused = $bindable(false),
        wrap = false,
        parent
    }:{
        value:string,
        parent:{block_id:number,class_id:number,item_id:number}
        focused?:boolean,
        wrap?:boolean
    } = $props();

    const svelte_id=$props.id();

    let textEditor:HTMLDivElement;

    $effect(()=>{
        if(focused){
            if(!match_focus_element(parent)){
                console.log('set focus')
                context.focus_element={
                    ...parent,
                    svelte_id
                };
            }
        }else if(match_focus_element(parent)){
            requestAnimationFrame(()=>{
                 console.log('exit focus')
                 context.focus_element=null;
            })            
        }
    })

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

