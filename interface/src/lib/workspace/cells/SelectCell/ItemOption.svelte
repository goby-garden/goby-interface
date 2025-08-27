<script lang="ts">
    import type {RelationItem,LabelProperties} from './types';

    let {
        item,
        target_labels
    }:{
        item:RelationItem,
        target_labels:LabelProperties
    } = $props();

    let label_prop=$derived(target_labels[item.class_id]);
    let label:string | null = $derived(label_prop ? item[`user_${label_prop}`] : null);
    
</script>

<button>{label}</button>

<style>
    button{
        background:none;
    }

    button::before{
        content:'';
        height:4px;
        width:4px;
        vertical-align:middle;
        margin-right:4px;
        background-color:rgba(255, 0, 0, 0.484);
        display:inline-block;
        transform:translateY(-1px);
    }
</style>