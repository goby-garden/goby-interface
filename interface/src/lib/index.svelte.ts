import type { ElectronAPI } from '../../../app/src/preload.cjs';
import { browser } from '$app/environment';

export let instance:{
    electron:ElectronAPI | undefined
} = $state({
    electron:undefined
})

if(browser){
    // @ts-ignore
    instance.electron=window.electronAPI
}