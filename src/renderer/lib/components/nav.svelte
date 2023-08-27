<script>
    export let title='goby.garden';
</script>

<div id='os-top-bar' class='system'>
    <h1>{title}</h1>
</div>
<div id='nav-placeholder'></div>


<style>
    #os-top-bar{
        height:31px;
        width:100%;
        -webkit-app-region: drag;
        border-bottom:1px solid rgba(255,255,255,0.2);
        display:flex;
        flex-flow:row nowrap;
        align-items:center;
        box-sizing:border-box;
        background-color:#404040;
        color:white;
        justify-content:center;
        position:fixed;
        top:0;
        left:0;
        z-index:1000;
    }

    #os-top-bar h1{
        position:relative;
        /* top:-1px; */
        /* flex:1; */
        background-color:#404040;
        font-family:'fragment-mono','Osaka','Menlo';

        -webkit-app-region: no-drag;
        box-sizing:border-box;
        text-align:center;
    }

    #nav-placeholder{
        height:31px;
    }
</style>