<script>
    // utilities and stores
    import { onMount,setContext } from "svelte";
    import { next_focus_id,focused } from '$lib/store.js';

    // components
    import Nav from '$lib/components/nav.svelte';
    import ContextMenu from '$lib/components/workspace/contextmenu.svelte';
    import Item from '$lib/components/workspace/item.svelte';
    

    /*** @type {{ ready: () => any; }} */
    let electron;
    /*** @type {{ project_name: any; }} */
    let data;
    let mouse_grid_pos=[0,0];
    let mouse_hover_visible=false;
    let drag={
        start:[0,0],
        end:[0,0],
        on:false
    }
    
    // let window_meta={
    //     page_contents:[]
    // }
    let window_meta;
    /**
     * @type {any[]}
     */
    let page_contents=[];

    let contextmenu_coords=[0,0]

    let mousedown_wait=false;

    
    $:drag.end=mouse_grid_pos;
    let add_drag=()=>{
        if(mousedown_wait){
            drag.on=true;
            mousedown_wait=false;
        }
    }
    let remove_drag=()=>{
        drag.on=false;
        window.removeEventListener('mouseup',remove_drag);
        window.removeEventListener('mousemove',add_drag);
    };
    let contextmenu_id;

    let contextmenu_actions=[
        {key:'create_class',value:'create class'},
        {key:'add_image',value:'add image'}
    ]

    /**
     * @param {FrameRequestCallback} fn
     */
    function delay_function(fn){
        requestAnimationFrame(()=>{
            requestAnimationFrame(fn);
        })
    }

    setContext('delay_function', delay_function);
    

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
        let new_y=Math.floor((event.pageY - 31)/30);
        mouse_grid_pos[0]=new_x;
        mouse_grid_pos[1]=new_y;
     
        
        
        
    
    }

    function start_drag(event){
        if(event.srcElement.id=='grid'){
            
            drag.start[0]=mouse_grid_pos[0];
            drag.start[1]=mouse_grid_pos[1];
            window.addEventListener('mousemove',add_drag)
            setTimeout(()=>{
                mousedown_wait=true;
            },5)

            window.addEventListener('mouseup',()=>{
                delay_function(remove_drag)
            }
            
            )
        }
        
       
        
    }

    function open_context_menu(event){
        focused.set(contextmenu_id);
        contextmenu_coords=[
            event.pageX,
            event.pageY
        ]
    }

    function handle_click(event){
        let src=event.srcElement;

        if(!src.closest('.focus')&&$focused) focused.set(undefined);
        else if(src.id=='grid'&&!drag.on){
            console.log('grid click')
  
            page_contents=[...page_contents,
                {
                    type:'item',
                    props:{
                        id:null,
                        type:'text',
                        value:'',
                        pos:[mouse_grid_pos[0],mouse_grid_pos[1]],
                        size:[1,1],
                        auto_sizing:[true,true]
                    },
                    session:{
                        focus_id:next_focus_id()
                    }
                }
            ]
            
            delay_function(()=>{
                focused.set(page_contents[page_contents.length-1].session.focus_id);
                
            })
            
        }
        // if(event.currentTarget)
    }
    

    function save_or_discard_item(block,i){
        console.log(block);
        if(block.props.value.length>0){

        }else{
            page_contents.splice(i,1);
            page_contents=page_contents;
        }
    }

   
    
    let n=0;
</script>

<svelte:head>
    <link rel="stylesheet" href="../css/clearstyle.css" >
    <link rel="stylesheet" href="../css/global.css" >
    <link rel="stylesheet" href="../css/md.css" >
	<!-- <title>[project] workspace</title> -->
</svelte:head>
<svelte:window on:mouseenter={()=>{mouse_hover_visible=true}} on:mouseout={()=>{mouse_hover_visible=false}}></svelte:window>

<Nav title={(data?.project_name||'project')+" — workspace"} />
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div id="page" on:mousemove={set_grid_pos}  on:mousedown={start_drag} on:click={handle_click}>
    <div id="grid" on:contextmenu={open_context_menu}></div>
    <div id='grid-hover' class:on={mouse_hover_visible} style="--x:{mouse_grid_pos[0]}; --y:{mouse_grid_pos[1]};"></div>
    <div id="grid-drag-select" class:on={drag.on} style="--x:{drag.start[0]}; --y:{drag.start[1]}; --x2:{drag.end[0]}; --y2:{drag.end[1]};" ></div>

    {#each page_contents as block,i}
        {#if block.type=='item'}
            <Item bind:props={block.props} bind:focus_id={block.session.focus_id} on:value_check={()=>{ save_or_discard_item(block,i) }}/>
        {/if}
    {/each}

</div>

<ContextMenu bind:focus_id={contextmenu_id} coords={contextmenu_coords} bind:actions={contextmenu_actions}/>



<style>
    :global(body){
        /* width:fit-content; */
    }
    :global(body)::-webkit-scrollbar {
        display: none;
    }

    #page{
        --col-light:#f8f6f6;
        min-height:110vh;
        min-width:110vw;
        position:relative;
    }

    #grid{
        background-size: 30px 30px;
        background-image:
        linear-gradient(to right, var(--col-light) 1px, transparent 1px),
        linear-gradient(to bottom, var(--col-light) 1px, transparent 1px);
        position:absolute;
        width:100%;
        height:100%;
        top:0;
        left:0;
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