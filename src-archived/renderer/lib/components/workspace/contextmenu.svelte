<script>
    import { createEventDispatcher } from 'svelte';
    import { next_focus_id,focused } from '$lib/store.js';
    const dispatch = createEventDispatcher();

    export let focus_id = next_focus_id();
    export let actions=[
        {key:'do_stuff',value:'do stuff'}
    ];
    export let coords=[0,0];

    $: grid_coords=[
        Math.floor(coords[0]/30),
        Math.floor(coords[1]/30)
    ]

    function select(key){
        console.log('selected',key);
        dispatch('selected', key);
    }
</script>
<div class='contextmenu-square' class:visible={$focused==focus_id} style="--x:{grid_coords[0]}; --y:{grid_coords[1]};"></div>
<ul class='contextmenu focusable' class:focus={$focused==focus_id} data-id="{focus_id}" style="--x:{coords[0]+10}px; --y:{coords[1]-2}px;">
    {#each actions as action }
        <li class='noselect system'>
            <button on:click={()=>select(action.key) }>{action.value}</button>
        </li>
    {/each}
</ul>


<style>
    .contextmenu{
        position:absolute;
        top:var(--y);
        left:var(--x);
        background-color:#404040;
        color:white;
        width:fit-content;
        border-radius:5px;
        min-width:fit-content;
    }

    .contextmenu-square{
        width:30px;
        height:30px;
        position:absolute;
        top:calc(var(--y) * 30px + 1px);
        left:calc(var(--x) * 30px + 1px);
        pointer-events:none;
        background-color:var(--col-light);
    }

    .contextmenu-square:not(.visible){
        display:none;
    }

    /* .contextmenu li{
        
    } */

    .contextmenu button,.contextmenu li{
        min-width:100%;
    }

    .contextmenu button{
        background-color:inherit;
        height:26px;
        padding:0px 8px;
        display:flex;
        flex-flow:row nowrap;
        align-items:center;
        justify-content: flex-start;
        box-sizing:border-box;
        white-space:nowrap;
    }

    .contextmenu li button:not(li:last-of-type button){
        border-bottom:1px solid rgba(255,255,255,0.1);
    }

    .contextmenu:not(.focus){
        display:none;
    }

    @media(hover:hover){
        .contextmenu button:hover{
            border-bottom:none;
            background-color:rgba(255,255,255,0.1);
        }
    }
</style>