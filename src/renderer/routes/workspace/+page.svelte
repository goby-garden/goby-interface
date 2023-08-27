<script>
    import { onMount } from "svelte";
    import { browser } from '$app/environment';
    import Nav from '$lib/components/nav.svelte';

    //    import Database from 'better-sqlite3'; 
    let electron;
    let data;

    onMount(() => {
        // @ts-ignore
        electron=window.electronAPI;
        page_init();
        
	});


    async function page_init(){
        data=await electron.ready();
        console.log(data);
    }
    
    let n=0;
</script>

<svelte:head>
    <link rel="stylesheet" href="../css/clearstyle.css" >
    <link rel="stylesheet" href="../css/global.css" >
	<!-- <title>[project] workspace</title> -->
</svelte:head>

<Nav title={(data?.project_name||'project')+" — workspace"} />
<div id="page"></div>

<style>
    #page{
        --col-light:#F5F5F5;
        background-size: 30px 30px;
        background-image:
        linear-gradient(to right, var(--col-light) 1px, transparent 1px),
        linear-gradient(to bottom, var(--col-light) 1px, transparent 1px);
        min-height:110vh;
        min-width:110vw;
    }
</style>
<!-- <h1>hello nico!</h1> -->

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- <button on:click={()=>{n++}}>hug: {n}</button> -->