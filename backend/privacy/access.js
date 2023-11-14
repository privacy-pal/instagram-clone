"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
function handleAccess(dataSubjectId, locator, obj) {
    switch (locator.dataType) {
        case "user":
            return handleAccessUser(dataSubjectId, locator, obj);
        case "post":
            return handleAccessPost(dataSubjectId, locator, obj);
        case "message":
            return handleAccessMessage(dataSubjectId, locator, obj);
        case "chat":
            return handleAccessChat(dataSubjectId, locator, obj);
        default:
            throw new Error("Unknown data type ".concat(locator.dataType));
    }
}
exports.default = handleAccess;
function handleAccessUser(dataSubjectId, locator, obj) {
    var _a;
    if (obj._id.toString() !== dataSubjectId || ((_a = locator.context) === null || _a === void 0 ? void 0 : _a.showUserInformation) === "usernameOnly") {
        return { username: obj.username };
    }
    return {
        name: obj.name,
        email: obj.email,
        username: obj.username,
        password: obj.password,
        avatar: obj.avatar,
        bio: obj.bio,
        website: obj.website,
        posts: obj.posts.map(function (postId) { return ({
            dataType: "post",
            singleDocument: true,
            collection: "posts",
            filter: {
                _id: postId
            },
            context: { postType: "owned" }
        }); }),
        saved: obj.saved.map(function (postId) { return ({
            dataType: "post",
            singleDocument: true,
            collection: "posts",
            filter: {
                _id: postId
            },
            context: { postType: "saved" }
        }); }),
        followers: obj.followers.map(function (userId) { return ({
            dataType: "user",
            singleDocument: true,
            collection: "users",
            filter: {
                _id: userId
            },
            context: { userType: "follower" }
        }); }),
        following: obj.following.map(function (userId) { return ({
            dataType: "user",
            singleDocument: true,
            collection: "users",
            filter: {
                _id: userId
            },
            context: { userType: "following" }
        }); }),
    };
}
function handleAccessPost(dataSubjectId, locator, obj) {
    if (obj.postedBy !== dataSubjectId) {
        return { caption: obj.caption, image: obj.image };
    }
    return {
        caption: obj.caption,
        image: obj.image,
        likes: obj.likes.map(function (userId) { return ({
            dataType: "user",
            singleDocument: true,
            collection: "users",
            filter: {
                _id: new mongodb_1.ObjectId(userId)
            },
            context: { showUserInformation: "usernameOnly" }
        }); }),
        comments: obj.comments.map(function (comment) { return ({
            dataType: "comment",
            singleDocument: true,
            collection: "comments",
            filter: {
                _id: new mongodb_1.ObjectId(comment._id)
            },
        }); }),
        savedBy: obj.savedBy.map(function (userId) { return ({
            dataType: "user",
            singleDocument: true,
            collection: "users",
            filter: {
                _id: new mongodb_1.ObjectId(userId)
            },
            context: { showUserInformation: "usernameOnly" }
        }); }),
        createdAt: obj.createdAt,
    };
}
function handleAccessMessage(dataSubjectId, locator, obj) {
    return {};
}
function handleAccessChat(dataSubjectId, locator, obj) {
    return {};
}
