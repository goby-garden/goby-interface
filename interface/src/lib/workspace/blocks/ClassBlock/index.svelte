<script lang="ts">
    import type {BlockIterable} from '$lib/workspace/utils.ts';
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
                    <div class="property-column-header" role="columnheader">{property.name}</div>
                {/each}
            </div>
        </div>
        <div role="rowgroup">
            {#each data.items || [] as item,i}
                <div role="row" class="item class-table-row" class:last-item={i==data.items.length-1}>
                    {#each data.properties as property}
                    <div role="cell" class="cell" data-type="{property.type}">
                        {#if property.type=='data'&&property.data_type=='string'}
                            {item['user_'+property.name]}
                        {/if}
                    </div>
                    {/each}
                    <!-- <div class="cell">{item.user_Name}</div> -->
                </div>
            {/each}
        </div>
        
    </section>
    
</div>
{/if}

<style>
    .class-block{
        position:relative;
        border:1px solid #E5E5E5;
        border-bottom:none;
        /* padding:20px; */
        /* padding-inline:14px;
        padding-block:40px 0px; */
        padding-block:0px 10px;
        margin:20px;
        display:grid;
        grid-template-columns:14px 1fr 14px;
        grid-template-rows:auto;
        width:fit-content;
    }

    .class-meta{
        grid-column:1 / 4;
        /* top:0;
        left:0;
        width:100%; */
        padding-bottom:4px;
    }

    .class-table-view{
        grid-column:2 / 3;
        display:grid;
        grid-template-columns:repeat(var(--n-properties),1fr);
        grid-template-rows:repeat(auto,40px);
        min-width:calc(var(--n-properties) * 180px);
        gap:0px 14px;
    }

    .class-table-row{
        grid-column:1 / calc(var(--n-properties) + 1);
        display:grid;
        grid-template-columns: subgrid;
        padding-block:8px;
        
    }

    .item{
        padding-block:10px 7px;

    }

    .properties-table-header,
    .item:not(.last-item){
        border-bottom:1px solid #E5E5E5;
    }

    div[role="rowgroup"]{
        display:contents;
    }

    .cell[data-type="data"]{
        line-height:1.3em;
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
        --icon-size:10px;
        margin-left:calc(var(--icon-size) * -0.5);
        width: fit-content;
    }

    .property-column-header{
        font-weight:600;
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