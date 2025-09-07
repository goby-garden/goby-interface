<script lang="ts">
    import { instance } from '$lib/index.svelte.js';
    import type { ClassData, Property } from 'goby-database/dist/types';
    import ItemOption from './ItemOption.svelte';
    import type { LabelProperties, RelationItem } from '$lib/types';
    import { mission_control } from '$lib/workspace/workspace.svelte';
    let {
        focused=$bindable(false),
        target_labels,
        target_classes,
        property,
        selected = [],
        edit_selection
    }:{
        focused:boolean,
        target_labels:LabelProperties,
        target_classes:ClassData[],
        property:Property,
        selected:RelationItem[],
        edit_selection:(obj:{
            action:'add' | 'remove'
            item:RelationItem
        })=>void
    } = $props();

    let option_input:HTMLElement | undefined=$state();
    let option_search_str:string=$state('');

    let prev_focus_state=$state(false);

    let filtered_options:RelationItem[]=$state([]);

    $effect(()=>{
        if(focused!==prev_focus_state){
            if(focused){
                handle_focus_init();
            }else{
                option_search_str='';
            }

            prev_focus_state=focused;
        }
    })

    async function handle_focus_init(){
        if(document.activeElement!==option_input){
            option_input?.focus();
        }
        // this will need to be cached more effectively in the future.
        // see get_relation_options mission control for more info
        if(filtered_options.length==0){
            try{
                const fetched=await mission_control.get_relation_options($state.snapshot(property));
                filtered_options=fetched || [];
            }catch(e){
                console.log(e);
            }

            
        };
    }

    function not_selected(item:RelationItem){
        const determination=!selected?.some((sel)=>(sel.system_id==item.system_id)&&(sel.class_id==item.class_id));
        return determination;
    }

    let display_options=$derived(filtered_options.filter((item)=>{
        if(option_search_str.length==0) return true;
        const label_prop=target_labels[item.class_id];
        const prop=item[`user_${label_prop}`];
        return prop.toLowerCase()?.includes(option_search_str.toLowerCase());
    }));


    function target_includes_exact_match(class_id:number){
        return display_options.some((opt)=>{
            const label_prop=target_labels[opt.class_id];
            const prop=opt[`user_${label_prop}`];
            return opt.class_id==class_id && prop==option_search_str;
        })
    }

    let create_new_buttons=$derived(target_classes.filter((cls)=>{
        return !target_includes_exact_match(cls.id)
    }))

    function option_click_handler({item}:{item:RelationItem}){
        option_search_str='';
        edit_selection({action:'add',item});
    }

</script>

<div class='select-edit-field' class:focused>
    <input 
        class="search-add-options"
        type="text"
        bind:this={option_input}
        bind:value={option_search_str}
        onfocus={()=>focused=true}
     />
     <div class="option-overlay">
        {#if create_new_buttons.length>0 && option_search_str.length>0}
            <div class="create-new">
                {#each create_new_buttons as cls}
                    <button>{cls.name}</button>
                {/each}
            </div>
            
        {/if}
        {#if display_options.length>0}
        <ul>
            {#each display_options as item}
                <li class:unselected={not_selected(item)}>
                    <ItemOption {item} {target_labels} click_handler={option_click_handler} />
                </li>
            {/each}
        </ul>
        {/if}
     </div>
     <!-- {#if display_options.length>0}
     {/if} -->
</div>



<style>
    .create-new{

        display:flex;
        flex-flow:row nowrap;
        gap:9px;
    }

    .create-new button{
        color:green;
        padding-block:2px;
    }

    .create-new button:hover{
        background-color:white;
    }

    .create-new button::before{
        content:'+';
        margin-right:3px;
    }

    .select-edit-field{
        position:relative;
    }
    li:not(.unselected){
        pointer-events:none;
        order:2;
        /* NOTE: in the future change the color instead */
        opacity:0.2;

        & :global(button){
            pointer-events:none;
        }
    }


    .option-overlay{
        display:none;
        min-width:fit-content;
        width:calc(100% + 20px);
        border:1px var(--col-border) solid;
        border-radius:3px;
        position:absolute;
        bottom:-4px;
        left:-10px;
        transform:translateY(100%);
        background-color:var(--col-light-bg);
        z-index:10;
        padding:10px;
        box-sizing:border-box;
        box-shadow: 0px 3px 5px 5px #FFFFFF;
        max-height:200px;
        overflow:auto;
    }

     .focused .option-overlay{
        display:flex;
        flex-flow:column nowrap;
        gap:9px;
    }

    ul{
        display:flex;
        flex-flow:column nowrap;
        gap:5px;
        line-height:1.3em;
        --col-highlight:white;
    }

    li{
        white-space:nowrap;
    }

    li :global(button){
        width:100%;
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