"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
function handleDeletion(dataSubjectId, locator, obj) {
    console.log(locator);
    console.log(obj);
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
        if (locator.context.followedBy && locator.context.followedBy.toString() === dataSubjectId) {
            // if the user is followed by the data subject, remove data subject from his followers array
            fieldsToUpdate = {
                $pull: {
                    followers: new mongodb_1.ObjectId(dataSubjectId)
                }
            };
        }
        else if (locator.context.follows && locator.context.follows.toString() === dataSubjectId) {
            // if the user follows the data subject, remove data subject from his following array
            fieldsToUpdate = {
                $pull: {
                    following: new mongodb_1.ObjectId(dataSubjectId)
                }
            };
        }
        if (locator.context.savesDeletedPost !== undefined) {
            // if the user saves the deleted post, remove it from his saved array
            fieldsToUpdate = {
                $pull: {
                    saved: locator.context.savesDeletedPost
                }
            };
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
                dataType: "post",
                singleDocument: false,
                collection: "posts",
                filter: {
                    $or: [
                        { "likes": obj._id },
                        { "comments.user": obj._id }
                    ]
                },
                context: { likedOrCommentedBy: obj._id }
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
                dataType: "chat",
                singleDocument: false,
                collection: "chats",
                filter: {
                    users: obj._id
                }
            }
        ],
        deleteNode: true,
    };
}
function handleDeletionPost(dataSubjectId, locator, obj) {
    var _a, _b, _c, _d;
    if (((_a = locator.context.postedBy) === null || _a === void 0 ? void 0 : _a.toString()) === dataSubjectId) {
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
    else {
        if (((_c = locator.context.savedBy) === null || _c === void 0 ? void 0 : _c.toString()) === dataSubjectId) {
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
        if (((_d = locator.context.likedOrCommentedBy) === null || _d === void 0 ? void 0 : _d.toString()) === dataSubjectId) {
            // if the post is liked or commented by the data subject, remove it from the likes and comments
            return {
                nodesToTraverse: [],
                deleteNode: false,
                fieldsToUpdate: {
                    $pull: {
                        likes: new mongodb_1.ObjectId(dataSubjectId),
                        comments: {
                            user: new mongodb_1.ObjectId(dataSubjectId)
                        }
                    }
                }
            };
        }
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
        nodesToTraverse: [{
                dataType: "message",
                singleDocument: false,
                collection: "messages",
                filter: {
                    sender: new mongodb_1.ObjectId(dataSubjectId),
                }
            }],
        deleteNode: false,
        fieldsToUpdate: {
        // $pull: {
        //     users: new ObjectId(dataSubjectId)
        // }
        }
    };
}
