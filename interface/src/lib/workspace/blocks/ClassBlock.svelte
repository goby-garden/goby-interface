<script lang="ts">
    import { instance } from '$lib/index.svelte.js';
    import type {BlockIterable} from '$lib/workspace/utils.ts';
    import TextCell from '$lib/workspace/cells/TextCell/index.svelte';
    import SelectCell from '$lib/workspace/cells/SelectCell/index.svelte';
    let {
        block = $bindable()
    }:{
        block:BlockIterable
    } = $props();

    let {data} = block;
        
</script>
{#if data}
<div class="class-block">
    <div class="class-meta">
        <h3 class="class-name"><span class="class-icon"></span>{data.name}</h3>
    </div>
    <section role="table" class="class-table-view" style:--n-properties={data.properties.length}>
        <div role="rowgroup">
            <div role="row" class="properties-table-header class-table-row">
                {#each data.properties as property}
                    <div class="property-column-header class-table-cell" role="columnheader">{property.name}</div>
                {/each}
            </div>
        </div>
        <div role="rowgroup">
            {#each data.items.loaded || [] as item,i}
                {@const item_identification={block_id:block.block_id,class_id:data.id,item_id:item.system_id}}
                <div role="row" class="item class-table-row" class:last-item={i==data.items.loaded.length-1}>
                    {#each data.properties as property}
                    <div role="cell" class="class-table-cell" data-prop-type="{property.type}">
                        {#if property.type=='data'}
                            {#if property.data_type=='string'}
                                <TextCell 
                                    bind:value={item['user_'+property.name]} 
                                    parent= {item_identification}
                                    {property}
                                    />
                            {/if}
                        {:else if property.type=='relation'}
                            <SelectCell 
                                bind:value={item['user_'+property.name]}
                                max_values={property.max_values}
                                parent={item_identification}
                                {property}
                            />
                        {/if}
                    </div>
                    {/each}
                </div>
            {/each}
        </div>
        
    </section>
    
</div>
{/if}

<style>
    .class-block{
        position:relative;
        border:1px solid var(--col-border);
        border-bottom:none;
        /* padding:20px; */
        /* padding-inline:14px;
        padding-block:40px 0px; */
        padding-block:0px 0px;
        margin:20px;
        display:grid;
        --outer-padding:14px;
        grid-template-columns:var(--outer-padding) 1fr var(--outer-padding);
        grid-template-rows:auto;
        width:fit-content;
        min-width:fit-content;
        max-width:fit-content;

        /* temp */
        margin-bottom:100px;
    }

    .class-meta{
        grid-column:1 / 4;
        /* top:0;
        left:0;
        width:100%; */
    }

    .class-table-view{
        grid-column:2 / 3;
        display:grid;
        grid-template-columns:repeat(var(--n-properties),max-content);
        grid-template-rows:repeat(auto,40px);
        gap:0px 28px;
        --default-col-width:40px;
    }

    .class-table-row{
        grid-column:1 / calc(var(--n-properties) + 1);
        display:grid;
        grid-template-columns: subgrid;
        padding-block:8px;
        
    }

    .class-table-cell{
        min-width:var(--default-col-width);
        /* width:min-content; */
        position:relative;
    }

    .class-table-cell:not(:first-child)::before{
        border-left:1px solid #F4F4F4;
        content:'';
        height:100%;
        position:absolute;
        top:0;
        left:-14px;
    }

    .item{
        padding-block:10px 7px;

    }

    
    /* .properties-table-header, */
    .item{
        /* border-bottom:1px solid var(--col-border); */
        /* border-top:1px solid #121212; */
        border-top:1px solid var(--col-border);
    }

    .properties-table-header{
        position:sticky;
        top:30px;
        /* background-color:white; */
        background:linear-gradient(0deg,rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 20%);
        z-index:6;
        padding-top:15px;
        /* border-bottom:1px solid black; */
    }


    div[role="rowgroup"]{
        display:contents;
    }

    .class-name{
        transform:translateY(-50%);
        font-weight:600;
        background-color: white;
        display:inline-block;
        padding-inline:0px 10px;
        padding-block:0px;
        display:flex;
        flex-flow:row nowrap;
        align-items:center;
        gap:calc(14px - var(--icon-size) * 0.5);
        --icon-size:12px;
        margin-left:calc(var(--icon-size) * -0.5);
        width: fit-content;
        /* color:green; */
    }

    .property-column-header{
        font-weight:600;
        white-space:nowrap;
    }

    .class-icon{
        background-color:green;
        border-radius:50%;
        
        width:var(--icon-size);
        height:var(--icon-size);
        display:inline-block;
        margin-bottom:2px;
    }
</style>