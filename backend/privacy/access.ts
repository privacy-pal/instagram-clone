import { ObjectId } from "mongodb";
import { MongoLocator } from "privacy-pal";

export default function handleAccess(dataSubjectId: string, locator: MongoLocator, obj: any): Record<string, any> {
    switch (locator.dataType) {
        case "user":
            return handleAccessUser(dataSubjectId, locator, obj)
        case "post":
            return handleAccessPost(dataSubjectId, locator, obj)
        case "message":
            return handleAccessMessage(dataSubjectId, locator, obj)
        case "chat":
            return handleAccessChat(dataSubjectId, locator, obj)
        default:
            throw new Error(`Unknown data type ${locator.dataType}`)
    }
}

function handleAccessUser(dataSubjectId: string, locator: MongoLocator, obj: any): Record<string, any> {
    if (obj._id.toString() !== dataSubjectId || locator.context?.showUserInformation === "usernameOnly") {
        return { username: obj.username }
    }
    return {
        name: obj.name,
        email: obj.email,
        username: obj.username,
        password: obj.password,
        avatar: obj.avatar,
        bio: obj.bio,
        website: obj.website,
        posts: obj.posts.map((postId: ObjectId): MongoLocator => ({
            dataType: "post",
            singleDocument: true,
            collection: "posts",
            filter: {
                _id: postId
            },
            context: { postType: "owned" }
        })),
        saved: obj.saved.map((postId: ObjectId): MongoLocator => ({
            dataType: "post",
            singleDocument: true,
            collection: "posts",
            filter: {
                _id: postId
            },
            context: { postType: "saved" }
        })),
        followers: obj.followers.map((userId: ObjectId): MongoLocator => ({
            dataType: "user",
            singleDocument: true,
            collection: "users",
            filter: {
                _id: userId
            },
            context: { userType: "follower" }
        })),
        following: obj.following.map((userId: ObjectId): MongoLocator => ({
            dataType: "user",
            singleDocument: true,
            collection: "users",
            filter: {
                _id: userId
            },
            context: { userType: "following" }
        })),
    }
}

function handleAccessPost(dataSubjectId: string, locator: MongoLocator, obj: any): Record<string, any> {
    if (obj.postedBy !== dataSubjectId) {
        return { caption: obj.caption, image: obj.image }
    }
    return {
        caption: obj.caption,
        image: obj.image,
        likes: obj.likes.map((userId: string): MongoLocator => ({
            dataType: "user",
            singleDocument: true,
            collection: "users",
            filter: {
                _id: new ObjectId(userId)
            },
            context: { showUserInformation: "usernameOnly" }
        })),
        comments: obj.comments.map((comment: any): MongoLocator => ({
            dataType: "comment",
            singleDocument: true,
            collection: "comments",
            filter: {
                _id: new ObjectId(comment._id)
            },
        })),
        savedBy: obj.savedBy.map((userId: string): MongoLocator => ({
            dataType: "user",
            singleDocument: true,
            collection: "users",
            filter: {
                _id: new ObjectId(userId)
            },
            context: { showUserInformation: "usernameOnly" }
        })),
        createdAt: obj.createdAt,
    }
}

function handleAccessMessage(dataSubjectId: string, locator: MongoLocator, obj: any): Record<string, any> {
    return {}
}

function handleAccessChat(dataSubjectId: string, locator: MongoLocator, obj: any): Record<string, any> {
    return {}
}
