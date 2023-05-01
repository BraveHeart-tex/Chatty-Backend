const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const MessageService = require("../services/messageService");

const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    res.status(400).send("Content and chatId are required");
    throw new Error("Content and chatId are required");
  }

  try {
    const message = await MessageService.createMessage(
      content,
      chatId,
      req.user._id
    );
    res.status(201);
    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

const getAllMessages = async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) {
    res.status(400).send("ChatId is required");
    throw new Error("ChatId is required");
  }

  try {
    const messages = await MessageService.getAllMessages(chatId);
    res.status(200);
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = {
  sendMessage,
  getAllMessages,
};
