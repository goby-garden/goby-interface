<script lang="ts">
    let {focused}:{focused:boolean} = $props();
</script>

<div class='select-edit-field' class:focused>
    <input type="text" />
</div>



<style>
    .select-edit-field{
        /* opacity:0;
        transition:opacity 0.3s; */
    }

    
    input{
        outline:none;
        border:none;
        border-radius:0;
        appearance:none;
        font-size:inherit;
        font-family:inherit;
        padding-block:3px 1px;
        /* NOTE: make this variable-based */
        background-color:#f3f3f3;
        /* border-bottom:1px solid #E5E5E5; */
        box-sizing:border-box;
        cursor:pointer;
    }

    .select-edit-field.focused input{
        cursor:text;
    }
    
</style>