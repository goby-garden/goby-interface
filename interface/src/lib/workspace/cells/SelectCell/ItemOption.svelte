<script lang="ts">
    import type {RelationItem,LabelProperties} from './types';

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
    <span class="option-inner"><span class="item-icon"></span>{label}</span>
   
</button>

<style>
    button{
        background:none;
        pointer-events:all;
        /* transition:background-color 0.3s; */
        position:relative;
        text-align:left;
    }

    .option-inner{
        position:relative;
        z-index:3;
    }
    

    button::after{
        z-index:1;
        content:'';
        position:absolute;
        width:100%;
        height:calc(100% + 6px);
        left:0;
    }
    button::after{
        top:-3px;
    }

    button:hover{
        background-color:var(--col-highlight,var(--col-light-bg));
        /* background-color:#f3f3f3; */
    }

    button .item-icon{
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