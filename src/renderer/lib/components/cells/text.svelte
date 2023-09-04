<script>
    import {getContext,createEventDispatcher} from 'svelte';
    import { focused } from '$lib/store.js';
    import { marked } from 'marked';
    let delay_function=getContext('delay_function');
    export let value='';
    export let size=[1,1];
    export let auto_sizing;
    export let this_focused;



    // let text=value;





    
    export let input;
    export let wrap_boundary=17;

    $:nowrap = size[0]<wrap_boundary;


    function smarten(a='') {
        //via https://leancrew.com/all-this/2010/11/smart-quotes-in-javascript/
        a = a.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
        a = a.replace(/'/g, "\u2019");                            // closing singles & apostrophes
        a = a.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
        a = a.replace(/"/g, "\u201d");                            // closing doubles
        return a
    };

    

    

    function handle_input(event){
        // console.log(event);
        input.parentNode.scrollLeft=0;
        // input.parentNode.scrollTop=0;

    
        let cursor_pos=get_cursor_pos();
        value=smarten(value);
        delay_function(()=>{
            set_cursor_pos(cursor_pos)
        })
        
        

      
        

        let grid_scroll_width=control_textarea_dimension('Width');
    
        if(grid_scroll_width-1<wrap_boundary&&auto_sizing[0]) size[0] = grid_scroll_width;
  

        // let grid_scroll_height=Math.ceil(scroll_height/30);
        delay_function(()=>{
            let grid_scroll_height=control_textarea_dimension('Height');
   
            if(auto_sizing[1]) size[1] = grid_scroll_height;
        })
    }

    function control_textarea_dimension(dimension='Height'){
        let d_lowercase=dimension.toLowerCase();

        if(dimension=="Width") input.classList.add('measuring');


        let scroll_dist=input['offset'+dimension];
        
        if(dimension=="Width") input.classList.remove('measuring');

        return Math.ceil(scroll_dist/30);
    }

    function handle_keydown(event){
        if(event.key=="Escape"){
            focused.set(undefined);
        }else if(event.shiftKey&&event.key=="Enter"){
            focused.set(undefined);
            // start new text block on next free line
        }
    }

    
    function get_cursor_pos(){
        // thank you https://stackoverflow.com/questions/64618729/how-do-you-get-and-set-the-caret-position-in-a-contenteditable/64823701#64823701

        var index = 0;
        var selection = window.getSelection();
        var textNodes = text_nodes_under(input);

        for(let i = 0; i < textNodes.length; i++) {
            let node = textNodes[i];
            var isSelectedNode = node === selection.focusNode;

            if(isSelectedNode) {
                index += selection.focusOffset;
                break;
            }
            else {
                index += node.textContent.length;
            }
        }

        return index;
    }

    function text_nodes_under(node) { 
        // https://stackoverflow.com/a/10730777/3245937
        var all = [];
        for (node=node.firstChild;node;node=node.nextSibling){
            if (node.nodeType==3) {
                all.push(node);
            }
            else {
                all = all.concat(text_nodes_under(node));
            }
        }
        return all;
    }

    function set_cursor_pos(new_pos) {
        var cumulativeIndex = 0;
        var relativeIndex = 0;
        var targetNode = null;

        var textNodes = text_nodes_under(input);

        for(var i = 0; i < textNodes.length; i++) {
            var node = textNodes[i];
            
            if(new_pos<= cumulativeIndex + node.textContent.length) {
                targetNode = node;
                relativeIndex = new_pos - cumulativeIndex;
                break;
            }

            cumulativeIndex += node.textContent.length;
        }

        var range = window.document.createRange();
        if(targetNode){
            range.setStart(targetNode, relativeIndex);
            range.setEnd(targetNode, relativeIndex);
            range.collapse();
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }

    }

   
</script>

<div class='input-value' class:visible={this_focused} bind:innerHTML={value} on:keydown={handle_keydown} contenteditable="plaintext-only" class:nowrap={nowrap}  bind:this={input} style="--w:{size[0]}; --h:{size[1]};" on:input={handle_input} role="textbox" tabindex="0">
</div>
<div class='render-value markdown-output' class:visible={!this_focused}>{@html marked.parse(value.replace(/&gt;+/g, '>')) }</div>


<style>

    .input-value,.input-value:focus{
        border: none;
        
        outline: none;
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
        resize: none; 
    }


    div:not(.visible){
        display:none;
    }

    .input-value,.render-value{
        font-family: 'authentic-sans';
        font-size:inherit;
        line-height:22px;
        padding:0px 6px;
        padding-top:6px;
        box-sizing:border-box;
    }

    :global(.render-value p){
        margin-bottom:8px;
    }

    .input-value{
        width:fit-content;
        max-width:100%;
        height:fit-content;
        overflow: clip;
        white-space: break-spaces;
        
    }

    :global(.input-value.nowrap,.input-value.measuring){
        white-space: nowrap;
        max-width:fit-content;
    }
    


    /* input[type="text"] {
        background: none;
        border: none;
        outline:none;
        
    }
    input[type="text"]:focus {
        background: white;
        border: none;
        outline:none;
    } */
</style>