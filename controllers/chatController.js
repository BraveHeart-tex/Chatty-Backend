const asyncHandler = require("express-async-handler");
const ChatService = require("../services/chatService");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const currentUser = req.user;

  const chat = await ChatService.accessChat(userId, currentUser);
  res.send(chat);
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const results = await ChatService.fetchChats(userId);
    res.status(200).send(results);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  try {
    const fullGroupChat = await ChatService.createGroupChat(
      req.body.name,
      JSON.parse(req.body.users),
      req.user
    );

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await ChatService.renameGroupChat(chatId, chatName);
    res.status(200).json(updatedChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const addToGroupChat = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const added = await ChatService.addToGroupChat(chatId, userId);
    res.status(200).json(added);
  } catch (error) {
    res.status(404);
    throw new Error(error.message);
  }
});

const removeFromGroupChat = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const removed = await ChatService.removeFromGroupChat(chatId, userId);
    res.status(200).json(removed);
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
};
