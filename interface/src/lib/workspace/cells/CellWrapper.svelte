<script lang="ts">
    import type { Snippet } from 'svelte'
    let {
        width = 'max-content',
        children
    }:{width?:string,children?:Snippet} = $props();
</script>

<div class="cell-content-wrapper" style="--width:{width};">
    {@render children?.()}
</div>


<style>
    .cell-content-wrapper{
        width:100%;
        max-width:100%;
        min-width:var(--width);
    }
</style>