"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
function handleDeletion(dataSubjectId, locator, obj) {
    switch (locator.dataType) {
        case "user":
            return handleDeletionUser(dataSubjectId, locator, obj);
        case "post":
            return handleDeletionPost(dataSubjectId, locator, obj);
        case "message":
            return handleDeletionMessage(dataSubjectId, locator, obj);
        case "chat":
            return handleDeletionChat(dataSubjectId, locator, obj);
        default:
            throw new Error("Unknown data type ".concat(locator.dataType));
    }
}
exports.default = handleDeletion;
function handleDeletionUser(dataSubjectId, locator, obj) {
    var thisUserId = obj._id.toString();
    if (thisUserId !== dataSubjectId) {
        var fieldsToUpdate = {};
        if (locator.context.followedBy === dataSubjectId) {
            // if the user is followed by the data subject, remove data subject from his followers array
            fieldsToUpdate.$pull = {
                followers: new mongodb_1.ObjectId(dataSubjectId)
            };
        }
        else if (locator.context.follows === dataSubjectId) {
            // if the user follows the data subject, remove data subject from his following array
            fieldsToUpdate.$pull = {
                following: new mongodb_1.ObjectId(dataSubjectId)
            };
        }
        if (locator.context.savesDeletedPost !== undefined) {
            // if the user saves the deleted post, remove it from his saved array
            fieldsToUpdate.$pull.saved = new mongodb_1.ObjectId(locator.context.savesDeletedPost);
        }
        return { nodesToTraverse: [], deleteNode: false, fieldsToUpdate: fieldsToUpdate };
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
    };
}
function handleDeletionPost(dataSubjectId, locator, obj) {
    var _a, _b, _c;
    if (((_a = locator.context.postedBy) === null || _a === void 0 ? void 0 : _a.toString()) === dataSubjectId) {
        console.log("here");
        // if the post is posted by the data subject, delete it
        return {
            nodesToTraverse: (_b = obj.savedBy) === null || _b === void 0 ? void 0 : _b.map(function (userId) { return ({
                dataType: "user",
                singleDocument: true,
                collection: "users",
                filter: {
                    _id: new mongodb_1.ObjectId(userId)
                },
                context: { savesDeletedPost: obj._id }
            }); }),
            deleteNode: true,
        };
    }
    else if (((_c = locator.context.savedBy) === null || _c === void 0 ? void 0 : _c.toString()) === dataSubjectId) {
        // if the post is saved by the data subject, remove it from the savedBy array
        return {
            nodesToTraverse: [],
            deleteNode: false,
            fieldsToUpdate: {
                $pull: {
                    savedBy: new mongodb_1.ObjectId(dataSubjectId)
                }
            }
        };
    }
    return {
        nodesToTraverse: [],
        deleteNode: false,
    };
}
function handleDeletionMessage(dataSubjectId, locator, obj) {
    return {
        nodesToTraverse: [],
        deleteNode: true,
    };
}
function handleDeletionChat(dataSubjectId, locator, obj) {
    return {
        nodesToTraverse: [],
        deleteNode: false,
        fieldsToUpdate: {
            $pull: {
                users: new mongodb_1.ObjectId(dataSubjectId)
            }
        }
    };
}