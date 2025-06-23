<script lang="ts">
    import {onMount} from 'svelte';
    import {context} from '$lib/workspace/store.svelte';
    import { instance } from '$lib/index.svelte.js';
    import { browser } from '$app/environment';
    import type Project from 'goby-database';
    import Nav from '$lib/global/nav.svelte';
    import ClassBlock from '$lib/workspace/blocks/ClassBlock.svelte';
    import {combinedBlockList} from '$lib/workspace/utils.js';

    let {blocks,items,classes} = $derived(context.workspace);


    let blocks_iterable=$derived.by(()=>{
        return combinedBlockList({blocks,classes});
    })

        
    
    onMount(async()=>{
        if(instance.electron){
            const fetched_workspace=await instance.electron.get_workspace();
            context.workspace={
                blocks:[...context.workspace.blocks,...fetched_workspace.blocks],
                classes:[...context.workspace.classes,...fetched_workspace.classes],
                items:[...context.workspace.items,...fetched_workspace.items]
            }
        }
    })
    
    $inspect('blocks_iterable',blocks_iterable)
    $inspect('classes',classes)

    

</script>

<Nav color_scheme="light"/>
<main>
    {#each blocks_iterable as block,b}
        {#if block.type=='class'}
            <ClassBlock bind:block={blocks_iterable[b]} />
        {/if}

    {/each}
</main>

<style>
    main{
        padding-inline:20px 20px;
        padding-block:20px 20px;
        min-width:fit-content;
    }
</style>

