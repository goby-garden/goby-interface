<script>
    import { onMount } from "svelte";
    import { browser } from '$app/environment';

    //    import Database from 'better-sqlite3'; 
    console.log(browser);


    onMount(() => {
        // @ts-ignore
        console.log(window.electronAPI)
        // @ts-ignore
        window.electronAPI.send_message('hi')
        
		// console.log(props, data);
	});
    
    let n=0;
</script>


<h1>hello nico!</h1>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<button on:click={()=>{n++}}>hug: {n}</button>