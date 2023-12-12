const catchAsync = require("../middlewares/catchAsync");
const Chat = require("../models/chatModel");

// Create New Chat
exports.newChat = catchAsync(async (req, res, next) => {

    const chatExists = await Chat.findOne({
        users: {
            $all: [req.user._id, req.body.receiverId]
        }
    });

    if (chatExists) {
        return res.status(200).json({
            success: true,
            newChat: chatExists
        });
    }

    const newChat = await Chat.create({
        users: [req.user._id, req.body.receiverId],
    });

    res.status(200).json({
        success: true,
        newChat
    });
});

// Get All Chats
exports.getChats = catchAsync(async (req, res, next) => {

    const [originalChats, chats] = await Promise.all([
        Chat.find({ users: { $in: [req.user._id] } }).sort({ updatedAt: -1 }),
        Chat.find({ users: { $in: [req.user._id] } }).sort({ updatedAt: -1 }).populate('users latestMessage')
    ]);

    // if a user is included in originalChat.users but not chats.users (_id field), it means that the user has deleted the chat
    // still add the user id to the chats array

    await addDeletedUsers(chats, originalChats);

    res.status(200).json({
        success: true,
        chats
    });

});

const addDeletedUsers = async (chats, originalChats) => {

    for (let i = 0; i < originalChats.length; i++) {
        for (let j = 0; j < originalChats[i].users.length; j++) {
            const chatIUsers = chats[i].users.map(user => user._id.toString());
            if (!chatIUsers.includes(originalChats[i].users[j].toString())) {
                chats[i].users.push(originalChats[i].users[j]);
            }
        }
    }

}