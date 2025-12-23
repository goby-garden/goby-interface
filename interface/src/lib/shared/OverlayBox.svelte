<script lang="ts">
    import type { Snippet } from 'svelte';

    let {
        span = "fit",
        children
        }:{
            span?:'fit' | 'fill'
            children?:Snippet
    } = $props();
</script>

{#if children}
    <div class="overlay-box" class:fill-w={span=='fill'} class:fit-w={span=='fit'}>
        {@render children?.()}
    </div>
{/if}

<style>
    .overlay-box{
        box-sizing:border-box;
        box-shadow: 3px 3px 0px 0px rgba(0, 0, 0, 0.15);
        background-color:#F5F5F5;
        height:fit-content;
    }

    .overlay-box.fit-w{
        width:fit-content;
    }

    .overlay-box.fill-w{
        width:100%;
    }
</style>