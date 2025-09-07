// NOTE: should centralize this in the future
export type RelationItem={
    class_id:number;
    system_id:number;
    // used for label
    [key:string]:any;
}

export type LabelProperties ={
    [key:string]:string | undefined
}