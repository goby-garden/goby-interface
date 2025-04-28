import type Project from 'goby-database';
import type { ClassData } from 'goby-database/dist/types';

type Workspace = ReturnType<Project["retrieve_workspace_contents"]>;

export function combinedBlockList({blocks = [],classes = []}:{blocks:Workspace["blocks"],classes:Workspace["classes"]}){
    return blocks.map((block)=>{
        const data:ClassData | undefined=block.type=='class'?(classes.find((c)=>c.id==block.thing_id)):undefined;
        return {
            ...block,
            data
        }
    })
}

export type BlockIterable = ReturnType<typeof combinedBlockList>[number];