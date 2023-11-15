import { UpdateFilter } from "mongodb";
import { MongoLocator } from "privacy-pal";
export default function handleDeletion(dataSubjectId: string, locator: MongoLocator, obj: any): {
    nodesToTraverse: MongoLocator[];
    deleteNode: boolean;
    fieldsToUpdate?: UpdateFilter<any> | Partial<any>;
};
