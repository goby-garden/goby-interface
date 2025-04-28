<script lang="ts">
    import type {BlockIterable} from '$lib/workspace/utils.ts';
    let {
        block = $bindable()
    }:{
        block:BlockIterable
    } = $props();

    let {data} = block;
</script>

<div class="class-block">
    {#each block.data?.items || [] as item}
        <div>{item.user_Name}</div>
    {/each}
</div>

<style>
    .class-block{
        border:1px solid #E5E5E5;
        padding:20px;
        margin:20px;
    }
</style>