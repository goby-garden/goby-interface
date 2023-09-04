import { writable } from 'svelte/store';

export let focus_id_counter = writable(0);
export let focused=writable(undefined);

let get_focus_id=0;

focus_id_counter.subscribe((val)=>{
    get_focus_id=val;
})





export function next_focus_id(){
    focus_id_counter.update((n) => n + 1);
    return get_focus_id;
}
