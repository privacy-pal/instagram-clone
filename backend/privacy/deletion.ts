import { ObjectId, UpdateFilter } from "mongodb";
import { MongoLocator } from "privacy-pal";

export default function handleDeletion(dataSubjectId: string, locator: MongoLocator, obj: any): {
    nodesToTraverse: MongoLocator[],
    deleteNode: boolean,
    fieldsToUpdate?: UpdateFilter<any> | Partial<any>
} {
    switch (locator.dataType) {
        case "user":
            return handleDeletionUser(dataSubjectId, locator, obj)
        case "post":
            return handleDeletionPost(dataSubjectId, locator, obj)
        case "message":
            return handleDeletionMessage(dataSubjectId, locator, obj)
        case "chat":
            return handleDeletionChat(dataSubjectId, locator, obj)
        default:
            throw new Error(`Unknown data type ${locator.dataType}`)
    }
}

function handleDeletionUser(dataSubjectId: string, locator: MongoLocator, obj: any): {
    nodesToTraverse: MongoLocator[],
    deleteNode: boolean,
    fieldsToUpdate?: UpdateFilter<any> | Partial<any>
} {
    const thisUserId = obj._id.toString()
    if (thisUserId !== dataSubjectId) {
        let fieldsToUpdate: UpdateFilter<any> | Partial<any> = {}
        if (locator.context.followedBy === dataSubjectId) {
            // if the user is followed by the data subject, remove data subject from his followers array
            fieldsToUpdate.$pull = {
                followers: new ObjectId(dataSubjectId)
            }
        } else if (locator.context.follows === dataSubjectId) {
            // if the user follows the data subject, remove data subject from his following array
            fieldsToUpdate.$pull = {
                following: new ObjectId(dataSubjectId)
            }
        }
        if (locator.context.savesDeletedPost !== undefined) {
            // if the user saves the deleted post, remove it from his saved array
            fieldsToUpdate.$pull.saved = new ObjectId(locator.context.savesDeletedPost)
        }
        return { nodesToTraverse: [], deleteNode: false, fieldsToUpdate }
    }

    // the user is the data subject
    return {
        nodesToTraverse: [
            {
                dataType: "post",
                singleDocument: false,
                collection: "posts",
                filter: {
                    postedBy: obj._id
                },
                context: { postedBy: obj._id }
            },
            {
                dataType: "post",
                singleDocument: false,
                collection: "posts",
                filter: {
                    savedBy: obj._id
                },
                context: { savedBy: obj._id }
            },
            {
                dataType: "user",
                singleDocument: false,
                collection: "users",
                filter: {
                    followers: obj._id
                },
                context: { followedBy: obj._id }
            },
            {
                dataType: "user",
                singleDocument: false,
                collection: "users",
                filter: {
                    following: obj._id
                },
                context: { follows: obj._id }
            },
            {
                dataType: "message",
                singleDocument: false,
                collection: "messages",
                filter: {
                    sender: obj._id
                },
            },
            {
                dataType: "chat",
                singleDocument: false,
                collection: "chats",
                filter: {
                    users: obj._id
                }
            }
        ],
        // deleteNode: true,
        deleteNode: false,
    }

}

function handleDeletionPost(dataSubjectId: string, locator: MongoLocator, obj: any): {
    nodesToTraverse: MongoLocator[],
    deleteNode: boolean,
    fieldsToUpdate?: UpdateFilter<any> | Partial<any>
} {
    if (locator.context.postedBy?.toString() === dataSubjectId) {
        console.log("here")
        // if the post is posted by the data subject, delete it
        return {
            nodesToTraverse: obj.savedBy?.map((userId: string): MongoLocator => ({
                dataType: "user",
                singleDocument: true,
                collection: "users",
                filter: {
                    _id: new ObjectId(userId)
                },
                context: { savesDeletedPost: obj._id }
            })),
            deleteNode: true,
        }
    } else if (locator.context.savedBy?.toString() === dataSubjectId) {
        // if the post is saved by the data subject, remove it from the savedBy array
        return {
            nodesToTraverse: [],
            deleteNode: false,
            fieldsToUpdate: {
                $pull: {
                    savedBy: new ObjectId(dataSubjectId)
                }
            }
        }
    }
    return {
        nodesToTraverse: [],
        deleteNode: false,
    }
}

function handleDeletionMessage(dataSubjectId: string, locator: MongoLocator, obj: any): {
    nodesToTraverse: MongoLocator[],
    deleteNode: boolean,
    fieldsToUpdate?: UpdateFilter<any> | Partial<any>
} {
    return {
        nodesToTraverse: [],
        deleteNode: true,
    }
}

function handleDeletionChat(dataSubjectId: string, locator: MongoLocator, obj: any): {
    nodesToTraverse: MongoLocator[],
    deleteNode: boolean,
    fieldsToUpdate?: UpdateFilter<any> | Partial<any>
} {
    return {
        nodesToTraverse: [],
        deleteNode: false,
        fieldsToUpdate: {
            $pull: {
                users: new ObjectId(dataSubjectId)
            }
        }
    }
}