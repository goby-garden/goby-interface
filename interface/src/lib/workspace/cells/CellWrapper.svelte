<script lang="ts">
    import type { Snippet } from 'svelte'
    let {
        data_type,
        children
    }:{data_type:string,children:Snippet} = $props();
</script>

<div class="cell-content-wrapper" data-type={data_type}>
    {@render children?.()}
</div>


<style>
    .cell-content-wrapper{
        width:100%;
        min-width:fit-content;
        line-height:1.3em;
    }
</style>