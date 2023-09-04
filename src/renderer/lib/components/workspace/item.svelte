<script>
    import {getContext,createEventDispatcher} from 'svelte';
    import TextCell from '$lib/components/cells/text.svelte';
    import { next_focus_id,focused } from '$lib/store.js';

    export let focus_id=0;
    const dispatch = createEventDispatcher();

    let autowrap_boundary=17;
    export let props={
        id:null,
        type:'text',
        value:'',
        pos:[0,0],
        size:[4,1],
        auto_sizing:[true,true]
    };

    let delay_function=getContext('delay_function');

    

    let input;
    export let node;

    let this_focused=false;
    // let focused=false;

    focused.subscribe((val)=>{

        if(val==focus_id){
            
            this_focused=true;
            delay_function(()=>{
                input.focus();
                place_text_cursor(input);
            })
        }else if(val!==focus_id&&this_focused){
            input.blur();
            this_focused=false;
            dispatch('value_check');
        }
        
    })

   function focus_item(){
        focused.set(focus_id);
   }

   function place_text_cursor(el) {
        // via https://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser
        if (typeof window.getSelection != "undefined"
                && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    
    
    // $: ({ id,type,value,pos,size,auto_sizing } = props);
    
</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={focus_item} class:focus={$focused==focus_id} bind:this={node} class="item" style="--x:{props.pos[0]}; --y:{props.pos[1]}; --w:{props.size[0]}; --h:{props.size[1]};">
    {#if props.type=='text'}
        <TextCell {this_focused}  bind:value={props.value} bind:size={props.size} auto_sizing={props.auto_sizing} bind:input={input}  wrap_boundary={autowrap_boundary}/>
    {/if}
</div>


<style>
    .item{
        position:absolute;
        top:calc(var(--y) * 30px);
        left:calc(var(--x) * 30px);
        width:calc(var(--w) * 30px + 1px);
        height:calc(var(--h) * 30px + 1px);
        background-color:white;
        border:1px solid var(--col-light);
        /* outline:1px solid red; */
        outline-offset:-0.5px;
        /* background-color:green; */
        box-sizing:border-box;
        overflow:clip;
    }
</style>