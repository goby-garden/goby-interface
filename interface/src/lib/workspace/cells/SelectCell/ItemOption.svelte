<script lang="ts">
    import type {RelationItem,LabelProperties} from '$lib/types';

    let {
        item,
        target_labels,
        click_handler = ()=>{}
    }:{
        item:RelationItem,
        target_labels:LabelProperties,
        click_handler?:(info:{e:MouseEvent,item:RelationItem})=>void
    } = $props();

    let label_prop=$derived(target_labels[item.class_id]);
    let label:string | null = $derived(label_prop ? item[`user_${label_prop}`] : null);

</script>

<button onclick={(e)=>click_handler({e,item})}>
    <span class="option-inner">
        <span class="item-icon"></span>
        <span class="item-label">{label}</span>
    </span>
   
</button>

<style>
    button{
        background:none;
        pointer-events:all;
        /* transition:background-color 0.3s; */
        position:relative;
        text-align:left;
        --item-highlight-left-padding:6px;
        --item-highlight-right-padding:6px;
    }

    .option-inner{
        position:relative;
        z-index:3;
        display:inline-flex;
        flex-flow:row nowrap;
        align-items:flex-start;
        gap:5px;
    }
    

    button::after{
        z-index:1;
        content:'';
        position:absolute;
        width:calc(100% + (var(--item-highlight-left-padding) + var(--item-highlight-right-padding)));
        height:100%;
        left:calc(var(--item-highlight-left-padding) * -1);
        /* transition:background-color 0.2s; */
    }

    button:hover::after{
        background-color:var(--col-highlight,#f5f5f5);
        /* background-color:#F5F5F5; */
    }

    button .item-icon{
        content:'';
        height:4px;
        width:4px;
        vertical-align:middle;
        margin-top: 7px;
        background-color:rgba(255, 0, 0, 0.484);
        display:inline-block;
        transform:translateY(-1px);
    }

    button .item-label{
        flex: 1;
    }
</style>