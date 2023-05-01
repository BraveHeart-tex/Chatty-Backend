const Chat = require("../models/chatModel");
const User = require("../models/userModel");

/**
 * Checks if a chat exists between two users and returns the chat if it exists,
 * Otherwise, it creates a new chat between them and returns the new chat object.
 * @async
 @param {string} userId - The user ID to check if there's a chat with.
 @param {object} currentUser - The current user object.
 @returns {Promise<object>} - Returns a chat object if the chat exists or a new chat object if it doesn't exist.
 @throws {Error} - If no user ID is provided or an error occurs while creating a new chat.
 */
const accessChat = async (userId, currentUser) => {
  if (!userId) {
    throw new Error("No user ID is provided");
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: currentUser._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name picture email",
  });

  if (isChat.length > 0) {
    return isChat[0];
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [currentUser._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      return FullChat;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

/**
 Fetches all chats that the user is a part of
 @async
 @param {string} userId - The ID of the user for whom to fetch the chats
 @returns {Promise<Array>} An array of chat objects that the user is a part of
 @throws {Error} If an error occurred while fetching the chats
 */
const fetchChats = async (userId) => {
  try {
    const results = await Chat.find({ users: { $elemMatch: { $eq: userId } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedResults = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name picture email",
    });

    return populatedResults;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 Creates a new group chat.
 @async
 @param {string} chatName - The name of the group chat.
 @param {Array} users - The users to be added to the group chat.
 @param {Object} groupAdmin - The admin user who created the group chat.
 @returns {Promise<Object>} Returns the newly created group chat.
 @throws {Error} Will throw an error if the required fields are not provided or if there are less than 2 users in the group chat.
 */
const createGroupChat = async (chatName, users, groupAdmin) => {
  if (!users || !chatName) {
    throw new Error("Please provide all the required fields");
  }

  if (users.length < 2) {
    throw new Error("Please provide at least two users to create a group chat");
  }

  users.push(groupAdmin);

  try {
    const groupChat = await Chat.create({
      chatName,
      users,
      isGroupChat: true,
      groupAdmin,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return fullGroupChat;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 Renames the name of a group chat.
 @async
 @param {string} chatId - The ID of the chat to rename.
 @param {string} chatName - The new name to give to the chat.
 @returns {Promise<object>} An object representing the updated chat.
 @throws {Error} If the chat is not found.
 */
const renameGroupChat = async (chatId, chatName) => {
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    throw new Error("Chat not found");
  }

  return updatedChat;
};

/**
 Adds a user to a group chat
 @async
 @param {string} chatId - The ID of the group chat to add the user to
 @param {string} userId - The ID of the user to add to the group chat
 @returns {Promise<object>} - The updated group chat object with the new user added
 @throws {Error} - If the chat cannot be found or there is an error while updating the chat
 */
const addToGroupChat = async (chatId, userId) => {
  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      throw new Error(`Chat not found with id: ${chatId}`);
    }

    return added;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Remove user from a group chat
 * @async
 * @param {string} chatId - The ID of the group chat
 * @param {string} userId - The ID of the user to remove from the group chat
 * @returns {Promise<object>} The updated group chat object
 */
const removeFromGroupChat = async (chatId, userId) => {
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    throw new Error(`Chat not found with id: ${chatId}`);
  } else {
    return removed;
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
};
