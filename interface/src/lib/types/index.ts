// NOTE: should centralize this in the future
export type RelationItem={
    class_id:number;
    system_id:number;
    prop_id?:number;
    // used for label
    [key:string]:any;
}

export type NewItem={
    class_id:number;
    prop_id?:number;
    label:string;
};

export type SelectionEdit={
    action: "add" | "remove";
    item: RelationItem | NewItem;
};



export type LabelProperties ={
    [key:string]:string | undefined
}


export type ItemRefreshQueue =Partial<Record<number,{
    modified_items:number[];
    created_items:number[]
    modified_properties:number[]
}>>