<script lang="ts">
    import type { ElectronAPI } from '../../../app/src/preload.cjs';
    import { onMount } from "svelte";
    import { browser } from '$app/environment';
    import Nav from '$lib/components/nav.svelte';
    // import clearstyles from '$lib/assets/clearstyles.png';

    //    import Database from 'better-sqlite3'; 
    console.log(browser);

    let project_file=undefined;
    let electron:ElectronAPI | undefined;

    onMount(() => {
        // @ts-ignore
        electron=window.electronAPI
	});

    async function specify_save_folder(){
        console.log('specify_save_folder');
        let file_path=await electron?.open_dialog('save');
        if(file_path) electron?.open_project(file_path,true)
    }

    async function specify_file_location(){
        console.log('specify_file_location')
        let file_path=await electron?.open_dialog('locate file');

        if(file_path) electron?.open_project(file_path,false)
    }
    
    let n=0;
    
</script>

<svelte:head>
    <link rel="stylesheet" href="css/clearstyle.css" >
    <link rel="stylesheet" href="css/global.css" >
	<title>goby.garden</title>
</svelte:head>

<Nav title="goby.garden" />


{#if !project_file}
    <form>
        <div id="open-or-create" class='system'>
            <button name="file-selector" on:click={specify_file_location}>open existing file</button>
            or
            <button name="new-project" on:click={specify_save_folder}>start a new project</button>
        </div>
        
        <!-- <label class='system' for="project-file-input">Open an existing project file</label>
        <input type="file" id="project-file-input" name="project-file-input" accept=".db" /> -->
    </form>
{/if}




<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- <button on:click={()=>{n++}}>hug: {n}</button> -->

<style>
    :global(body){
        background-color:#404040;
        color:white;
    }

    form{
        width:480px;
        margin:auto;
        padding:30px 0px;
        padding-bottom:0;
        line-height:30px;
        box-sizing:border-box;
        color:rgba(255,255,255,0.7);
    }

    
    

    #open-or-create{
        display:flex;
        flex-flow:row nowrap;
        align-items:center;
        justify-content: space-between;
        height:60px;
    }

    #open-or-create button{
        height:60px;
        box-sizing:border-box;
        color:white;
        width:210px;
        transition:background-color 0.1s,color 0.1s,border-color 0.1s;
    }

    #open-or-create button:hover{
        color:#404040;
        background-color:rgba(255,255,255,0.7);
        border-color:transparent;
    }

    #open-or-create button:focus{
        background-color:rgba(255,255,255,1);
    }

    button{
        background-color:inherit;
    }

    button[name="file-selector"]{
        width:210px;
        /* border:1px dashed white;  */
        border-radius:5px;
        background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='5' ry='5' stroke='%23FFFFFFB3' stroke-width='1' stroke-dasharray='6%2c 3' stroke-dashoffset='0' stroke-linecap='butt'/%3e%3c/svg%3e");
    }

    button[name="new-project"]{
       
        border:1px solid rgba(255,255,255,0.7); 
        border-radius:30px;
    }

    /* -webkit-app-region: drag; */
</style>

