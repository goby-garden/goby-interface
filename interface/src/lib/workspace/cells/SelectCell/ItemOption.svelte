<script lang="ts">
    import type {RelationItem,LabelProperties} from '$lib/types';

    
    type BaseOptionParams={
        single?:boolean;
    }

    type UnregisteredOption=BaseOptionParams & {
        registered:false;
        label:string;
        class_id:number;
        prop_id?:number;
        click_handler?:(info:{e:MouseEvent,label:string,class_id:number,prop_id?:number})=>void
    }

    type RegisteredOption=BaseOptionParams & {
        registered:true;
        item:RelationItem,
        target_labels:LabelProperties,
        click_handler?:(info:{e:MouseEvent,item:RelationItem})=>void
    }

    let props:(UnregisteredOption | RegisteredOption)=$props();

    let {
        single,
        registered
    } = $derived(props);
    
    let label=$derived.by(()=>{
        if(props.registered){
            let {
                item,
                target_labels,
            } = props;

            let label_prop=target_labels[item.class_id];

            return label_prop ? item[`user_${label_prop}`] : null;
        }else{
            return props.label;
        }
    })

    function click_passoff(e:MouseEvent){
        if(!props.click_handler) return;
        if(props.registered){
            props.click_handler({
                e,
                item:props.item
            })
        }else{
            props.click_handler({
                e,
                label,
                class_id:props.class_id,
                prop_id:props.prop_id
            })
        }
    }

</script>

<button onclick={click_passoff} class:single class:unregistered={!registered}>
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
        --item-highlight-left-padding:var(--field-offset);
        --item-highlight-right-padding:var(--field-offset);
        display:flex;
        flex-flow:row nowrap;
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
        pointer-events:none;
        width:calc(100% + (var(--item-highlight-left-padding) + var(--item-highlight-right-padding)));
        /* height:100%;
        top:0; */
        height: calc(100% + 2.5px);
        top: -2.5px;

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

    button.unregistered{
        color:rgba(200, 0, 0, 1);
    }

    button.single .item-icon{
        opacity:0;
        width:4px;
    }

   

    button .item-label{
        flex: 1;
        position:relative;
    }

    button.single .item-label::before{
        content:'';
        height:calc(100% + 2px);
        background-color:rgba(255, 0, 0, 0.484);
        width:4px;
        content:'';
        top:-2px;
        left:-10px;
        position:absolute;
    }
</style>