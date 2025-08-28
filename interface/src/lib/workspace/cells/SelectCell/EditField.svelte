<script lang="ts">
    let {
        focused=$bindable(false)
    }:{focused:boolean} = $props();

    let optionInput:HTMLElement | undefined=$state()

    let prev_focus_state=$state(false);

    $effect(()=>{
        if(focused!==prev_focus_state){
            if(focused&&document.activeElement!==optionInput){
                optionInput?.focus();
            }

            prev_focus_state=focused;
        }
    })
</script>

<div class='select-edit-field' class:focused>
    <input 
        class="search-add-options"
        type="text"
        bind:this={optionInput}
        onfocus={()=>focused=true}
     />
     <div class="option-overlay">
        (TK item options)
     </div>
</div>



<style>
    .select-edit-field{
        position:relative;
    }

   

    .option-overlay{
        display:none;
        width:calc(100% + 20px);
        min-height:200px;
        border:1px var(--col-border) solid;
        border-radius:5px;
        position:absolute;
        bottom:-4px;
        left:-10px;
        transform:translateY(100%);
        background-color:var(--col-light-bg);
        z-index:10;
        padding:10px;
        box-sizing:border-box;
        box-shadow: 0px 0px 5px 1px #FFFFFF;
    }

     .focused .option-overlay{
        display:block;
    }

    
    input{
        outline:none;
        border:none;
        border-radius:0;
        appearance:none;
        font-size:inherit;
        font-family:inherit;
        padding-block:3px 1px;
        /* NOTE: make this variable-based */
        background-color:var(--col-light-bg);
        /* border-bottom:1px solid var(--col-border); */
        box-sizing:border-box;
        cursor:text;
        width:100%;
    }

    .select-edit-field.focused input{
        cursor:text;
    }
    
</style>