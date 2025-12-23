<script lang="ts">
    import type { ClassData, Property, RelationTarget } from 'goby-database/dist/types';
    import type { LabelProperties, RelationItem } from '$lib/types';

    import { mission_control } from '$lib/workspace/workspace.svelte';
    import ItemOption from './ItemOption.svelte';
    import OverlayBox from '$lib/shared/OverlayBox.svelte';
    import { defined } from 'goby-database/dist/utils';

    let {
        focused=$bindable(false),
        target_labels,
        targets,
        property,
        selected = [],
        edit_selection,
        handle_create_new,
        hover = false,
        single = false,
        option_search_str = $bindable('')
    }:{
        focused:boolean,
        hover:boolean,
        single:boolean,
        target_labels:LabelProperties,
        targets:(RelationTarget & {class_data:ClassData})[],
        property:Property,
        selected:RelationItem[],
        option_search_str:string,
        edit_selection:(obj:{
            action:'add' | 'remove'
            item:RelationItem
        })=>void,
        handle_create_new:(obj:{class_id:number,prop_id?:number | null})=>void
    } = $props();

    let option_input:HTMLElement | undefined=$state();
    // let option_search_str:string=$state('');

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

    let create_new_buttons=$derived(targets.filter((target)=>{
        return !target_includes_exact_match(target.class_id)
    }))

    function option_click_handler({item,action = "add"}:{item:RelationItem, action?:'add' | 'remove'}){
        option_search_str='';
        edit_selection({action,item});
    }

    

</script>

<div class='select-edit-field' class:focused class:hover class:single>
    <input 
        class="search-add-options"
        type="text"
        bind:this={option_input}
        bind:value={option_search_str}
        onfocus={()=>focused=true}
     />
     {#if hover || focused}
        <button onclick={()=>focused=!focused} class="system toggle-overlay-button">
            <span class="icon" data-type="{single?"arrow":"close"}">{single?"^":"×"}</span>
        </button>
     {/if}
     {#if focused}
        {#if display_options.length>0}
            <div class="options-overlay-outer">
                <OverlayBox span="fill">
                    <div class="options-overlay-inner">
                        {#if display_options.length>0}
                        <ul>
                            {#if single&&selected.length>0 &&option_search_str.length==0}
                                <li class="unselected"><button onclick={()=>option_click_handler({item:selected[0],action:'remove'})} class="clear-single-select system">[none]</button></li>
                            {/if}
                            {#each display_options as item}
                                <li class:unselected={not_selected(item)}>
                                    <ItemOption registered {item} {target_labels} click_handler={option_click_handler} />
                                </li>
                            {/each}
                        </ul>
                        {/if}
                    </div>
                </OverlayBox>
            </div>
        {/if}
        {#if create_new_buttons.length>0 && option_search_str.length>0}
            <div class="create-new">
                {#each create_new_buttons as {class_data,class_id,prop_id}}
                    <OverlayBox>
                        <button onclick={()=>handle_create_new({class_id,prop_id})}>
                            <span class="system create-icon">+</span> 
                            {class_data.name}
                        </button>
                    </OverlayBox>
                {/each}
            </div>
        {/if}
     {/if}
     <!-- {#if display_options.length>0}
     {/if} -->
</div>



<style>
    .create-new{
        position:absolute;
        right:-4px;
        top:0;
        transform:translateX(100%);
        display:flex;
        flex-flow:column nowrap;
        align-items:flex-start;
        justify-content: flex-start;
        gap:6px;
    }

    .create-new button{
        display:flex;
        flex-flow:row nowrap;
        align-items:center;
        padding:4px 7px 3px;
        color:#FF675B;
        gap:5px;
    }

    

    .create-icon{
        background-color: #FF675B;
        color: #fafafa;
        width: 11px;
        height: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        margin-bottom: 1px;
    }

     .create-new button:hover{
        background-color:var(--col-border);
        /* background-color: #FF675B;
        color: #fafafa;
        & .create-icon{
            color: #FF675B;
            background-color: #fafafa;
        } */
    }



    .select-edit-field{
        position:relative;
        width:calc(100% + var(--field-offset));
        margin-left:calc(-1 * var(--field-offset));
    }

    .select-edit-field::before{
        position:absolute;
        top:8.5px;
        left:var(--field-offset);
        background-color:var(--col-border);
        content:'';
        height:4px;
        width:4px;
        opacity:0;
        pointer-events:none;
    }

    .toggle-overlay-button{
        background-color:#f5f5f5;
        height:22px;
        width:22px;
        position:absolute;
        top:0;
        right:0;
        opacity:0;
    }


    .select-edit-field.single.hover .toggle-overlay-button,
    .select-edit-field.focused .toggle-overlay-button{
        opacity:1;
    }

    .focused:not(.single) .toggle-overlay-button:hover{
        background-color:var(--col-border);
    }

    .toggle-overlay-button .icon{
        position:relative;
        /* top:-2px; */
        display:inline-block;
        
        transform-origin:center;
    }

    .toggle-overlay-button .icon[data-type="close"]{
        /* transform:rotate(45deg); */
    }

    .toggle-overlay-button .icon[data-type="arrow"]{
        transform:translateY(-2px) scale(-1);
    }

    .focused .toggle-overlay-button .icon[data-type="arrow"]{
        transform:translateY(3px) scale(1);
    }

    .select-edit-field.single::before{
        display:none;
    }

    .select-edit-field.hover::before,
    .select-edit-field:hover::before,
    .select-edit-field.focused::before{
        opacity:1;
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

    .clear-single-select{
        color:rgb(180, 180, 180);
        text-align:left;
    }

    .clear-single-select:hover{
        background-color:white;
    }

    .options-overlay-outer{
        width:100%;
        position:absolute;
        bottom:-4px;
        left:0px;
        transform:translateY(100%);
        height:fit-content;
        z-index:10;
    }

    .options-overlay-inner{
        width:100%;
        padding:6px 0px;
        box-sizing:border-box;
        max-height:200px;
        overflow:auto;
        display:flex;
        flex-flow:column nowrap;
        gap:9px;
    }


    .option-overlay{
       
        
        box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.15);
        
    }


    ul{
        display:flex;
        flex-flow:column nowrap;
        gap:var(--option-gap);
        line-height:1.3em;
        --col-highlight:white;
        --field-offset:4px;
        --option-gap:5.5px;
    }

    li{
        white-space:nowrap;
        width:100%;
        min-width:0;
        overflow-y:auto;
        padding-inline:8px;
        box-sizing:border-box;
        scrollbar-width:none;
        padding-top:2.5px;
    }

    li::-webkit-scrollbar{
        height:0px;
    }

    li :global(button){
        min-width:calc(100% - 3px);
        /* --item-highlight-right-padding:0px; */
    }

    
    input{
        outline:none;
        border:none;
        border-radius:0;
        appearance:none;
        font-size:inherit;
        font-family:inherit;
        padding-block:3px 1px;
        background-color: transparent;

        
        /* border-bottom:1px solid var(--col-border); */
        box-sizing:border-box;
        cursor:pointer;
        /* cursor:default; */
        width:100%;
        padding-left:calc(var(--field-offset) + 9px);
    }

    /* .select-edit-field:hover input, */
    /* .focused input{
        background-color:#F5F5F5;
    } */

    /* background-color:#F5F5F5; */

    .select-edit-field.focused input{
        cursor:text;
    }
    
</style>