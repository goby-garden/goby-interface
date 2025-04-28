<script lang="ts">
    import {onMount} from 'svelte';
    import { instance } from '$lib/index.svelte.js';
    import { browser } from '$app/environment';
    import type Project from 'goby-database';
    import Nav from '$lib/global/nav.svelte';
    import ClassBlock from '$lib/workspace/blocks/ClassBlock/index.svelte';
    import {combinedBlockList} from '$lib/workspace/utils.js';

    let workspace:ReturnType<Project["retrieve_workspace_contents"]>=$state({blocks:[],items:[],classes:[]})

    let {blocks,items,classes} = $derived(workspace);


    let blocks_iterable=$derived(combinedBlockList({blocks,classes}))

        
    
    onMount(async()=>{
        if(instance.electron){
            workspace=await instance.electron.get_workspace();
        }
    })
    
    $inspect('blocks_iterable',blocks_iterable)

    

</script>

<Nav color_scheme="light"/>

{#each blocks_iterable as block,b}
    {#if block.type=='class'}
        <ClassBlock bind:block={blocks_iterable[b]} />
    {/if}

{/each}



