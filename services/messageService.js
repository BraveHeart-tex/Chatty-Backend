const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const createMessage = async (content, chatId, senderId) => {
  let newMessage = {
    sender: senderId,
    content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender", "name picture");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name picture email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    return message;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getAllMessages = async (chatId) => {
  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    return messages;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  createMessage,
  getAllMessages,
};
