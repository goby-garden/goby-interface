<script>
    import { onMount } from "svelte";
    import { browser } from '$app/environment';
    import Nav from '$lib/components/nav.svelte';

    //    import Database from 'better-sqlite3'; 
    let electron;
    let data;
    let mouse_grid_pos=[0,0];
    let mouse_hover_visible=false;
    let drag={
        start:[0,0],
        end:[0,0],
        on:false
    }
    $:drag.end=mouse_grid_pos;
    let remove_drag=()=>{
        console.log('dragend')
        drag.on=false;
        window.removeEventListener('mouseup',remove_drag);
    };
    

    onMount(() => {
        // @ts-ignore
        electron=window.electronAPI;
        page_init();
    
        
	});


    async function page_init(){
        data=await electron.ready();
        console.log(data);
    }

    function set_grid_pos(event){
        mouse_hover_visible=true;
        let new_x=Math.floor(event.pageX/30);
        let new_y=Math.floor(event.pageY/30);
        mouse_grid_pos[0]=new_x;
        mouse_grid_pos[1]=new_y;
     
        
        
        
    
    }

    function start_drag(event){
        if(event.srcElement.id=='page'){
            console.log('dragstart')
            drag.on=true;
            drag.start[0]=mouse_grid_pos[0];
            drag.start[1]=mouse_grid_pos[1];
            window.addEventListener('mouseup',remove_drag)
        }
        
       
        
    }

   
    
    let n=0;
</script>

<svelte:head>
    <link rel="stylesheet" href="../css/clearstyle.css" >
    <link rel="stylesheet" href="../css/global.css" >
	<!-- <title>[project] workspace</title> -->
</svelte:head>
<svelte:window on:mouseenter={()=>{mouse_hover_visible=true}} on:mouseout={()=>{mouse_hover_visible=false}}></svelte:window>

<Nav title={(data?.project_name||'project')+" — workspace"} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div id="page" on:mousemove={set_grid_pos}  on:mousedown={start_drag}>
    <div id='grid-hover' class:on={mouse_hover_visible} style="--x:{mouse_grid_pos[0]}; --y:{mouse_grid_pos[1]};"></div>
    <div id="grid-drag-select" class:on={drag.on} style="--x:{drag.start[0]}; --y:{drag.start[1]}; --x2:{drag.end[0]}; --y2:{drag.end[1]};" ></div>

</div>

<style>
    :global(body)::-webkit-scrollbar {
        display: none;
    }

    #page{
        --col-light:#f8f6f6;
        background-size: 30px 30px;
        background-image:
        linear-gradient(to right, var(--col-light) 1px, transparent 1px),
        linear-gradient(to bottom, var(--col-light) 1px, transparent 1px);
        min-height:110vh;
        min-width:110vw;
    }

    #grid-hover{
        width:30px;
        height:30px;
        position:absolute;
        top:calc(var(--y) * 30px + 1px);
        left:calc(var(--x) * 30px + 1px);
        pointer-events:none;
        background-color:var(--col-light);
        opacity:0;
        transition:opacity 0.1s;
    }
    


   #grid-drag-select{
        pointer-events:none;
        background-color:var(--col-light);
        position:absolute;

        /* x:2  x2: 5  left: 2  w:3 */
        /* x:10  x2: 5  left: 5 w:5  */
        --l:min(var(--x2),var(--x));
        --t:min(var(--y2),var(--y));
        --abs-w:max(calc(var(--x2) - var(--x)),calc(var(--x) - var(--x2)) );
        --abs-h:max(calc(var(--y2) - var(--y)),calc(var(--y) - var(--y2)) );
        width:calc(var(--abs-w) * 30px + 30px);
        height:calc(var(--abs-h) * 30px + 30px);

        left:calc(var(--l) * 30px + 1px);
        top:calc(var(--t) * 30px + 1px);
        opacity:0;
        transition:opacity 0.1s;
   }

   #grid-drag-select.on,#grid-hover.on{
        opacity:1;
    }
   
</style>
<!-- <h1>hello nico!</h1> -->

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- <button on:click={()=>{n++}}>hug: {n}</button> -->