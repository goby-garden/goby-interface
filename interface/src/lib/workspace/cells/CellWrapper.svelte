<script lang="ts">
    import type { Snippet } from 'svelte'
    let {
        width = 'max-content',
        fill_height = false,
        children
    }:{width?:string,fill_height?:boolean,children?:Snippet} = $props();
</script>

<div class="cell-content-wrapper" style="--width:{width};" class:fill-height={fill_height}>
    {@render children?.()}
</div>


<style>
    .cell-content-wrapper{
        width:100%;
        max-width:100%;
        min-width:var(--width);
    }

    .cell-content-wrapper.fill-height{
        height:100%;
    }
</style>