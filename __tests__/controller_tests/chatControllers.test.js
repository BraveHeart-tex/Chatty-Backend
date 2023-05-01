const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
} = require("../../controllers/chatController");
const ChatService = require("../../services/chatService");

jest.mock("../../services/chatService", () => ({
  accessChat: jest.fn(),
  fetchChats: jest.fn(),
  createGroupChat: jest.fn(),
  renameGroupChat: jest.fn(),
  addToGroupChat: jest.fn(),
  removeFromGroupChat: jest.fn(),
}));

describe("Chat Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      user: {
        _id: "123",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
  });

  describe("accessChat", () => {
    it("should call ChatService.accessChat with correct arguments and return the result", async () => {
      const chat = { _id: "456", members: ["123", "789"] };
      ChatService.accessChat.mockResolvedValue(chat);

      req.body.userId = "789";

      await accessChat(req, res);

      expect(ChatService.accessChat).toHaveBeenCalledWith("789", {
        _id: "123",
      });
      expect(res.send).toHaveBeenCalledWith(chat);
    });

    it("should throw an error if ChatService.accessChat throws an error", async () => {
      const error = new Error("Chat not found");
      ChatService.accessChat.mockRejectedValue(error);

      req.body.userId = "789";

      await expect(accessChat(req, res)).rejects.toThrowError(error);

      expect(ChatService.accessChat).toHaveBeenCalledWith("789", {
        _id: "123",
      });
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe("fetchChats", () => {
    it("should call ChatService.fetchChats with correct arguments and return the result", async () => {
      const chats = [{ _id: "456", members: ["123", "789"] }];
      ChatService.fetchChats.mockResolvedValue(chats);

      await fetchChats(req, res);

      expect(ChatService.fetchChats).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(chats);
    });

    it("should throw an error if ChatService.fetchChats throws an error", async () => {
      const error = new Error("Error fetching chats");
      ChatService.fetchChats.mockRejectedValue(error);

      await expect(fetchChats(req, res)).rejects.toThrowError(error);

      expect(ChatService.fetchChats).toHaveBeenCalledWith("123");
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe("createGroupChat", () => {
    it("should call ChatService.createGroupChat with correct arguments and return the result", async () => {
      const chat = { _id: "456", name: "Test Chat", members: ["123", "789"] };
      ChatService.createGroupChat.mockResolvedValue(chat);

      req.body.name = "Test Chat";
      req.body.users = '["123","789"]';

      await createGroupChat(req, res);

      expect(ChatService.createGroupChat).toHaveBeenCalledWith(
        "Test Chat",
        ["123", "789"],
        { _id: "123" }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(chat);
    });

    it("should throw an error if ChatService.createGroupChat fails", async () => {
      const req = {
        user: {
          _id: "user123",
        },
        body: {
          name: "Test Chat",
          users: JSON.stringify(["user456", "user789"]),
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      ChatService.createGroupChat.mockRejectedValue(
        new Error("Failed to create group chat")
      );

      await createGroupChat(req, res);

      expect(ChatService.createGroupChat).toHaveBeenCalledWith(
        "Test Chat",
        ["user456", "user789"],
        { _id: "user123" }
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to create group chat",
      });
    });
  });

  describe("renameGroupChat function", () => {
    const mockRenamedChat = { id: "123", name: "New Name" };

    beforeEach(() => {
      jest
        .spyOn(ChatService, "renameGroupChat")
        .mockResolvedValue(mockRenamedChat);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should call ChatService.renameGroupChat with the correct arguments", async () => {
      const req = {
        body: {
          chatId: "123",
          chatName: "New Name",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await renameGroupChat(req, res);

      expect(ChatService.renameGroupChat).toHaveBeenCalledWith(
        "123",
        "New Name"
      );
    });

    it("should return the renamed chat", async () => {
      const req = {
        body: {
          chatId: "123",
          chatName: "New Name",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await renameGroupChat(req, res);

      expect(res.json).toHaveBeenCalledWith(mockRenamedChat);
    });

    it("should throw an error if ChatService.renameGroupChat rejects", async () => {
      const error = new Error("Chat not found");
      jest.spyOn(ChatService, "renameGroupChat").mockRejectedValue(error);

      const req = {
        body: {
          chatId: "123",
          chatName: "New Name",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
      };

      try {
        await renameGroupChat(req, res);
      } catch (error) {
        expect(error.message).toBe("Chat not found");
      }

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledTimes(0);
    });
  });
  describe("addToGroupChat", () => {
    it("should call ChatService.addToGroupChat with the correct arguments", async () => {
      const req = {
        body: {
          chatId: "chat123",
          userId: "user456",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await addToGroupChat(req, res);

      expect(ChatService.addToGroupChat).toHaveBeenCalledWith(
        "chat123",
        "user456"
      );
    });

    it("should return the added user when ChatService.addToGroupChat succeeds", async () => {
      const req = {
        body: {
          chatId: "chat123",
          userId: "user456",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const addedUser = {
        _id: "user456",
        name: "Jane Smith",
        email: "jane@example.com",
      };
      ChatService.addToGroupChat.mockResolvedValue(addedUser);

      await addToGroupChat(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(addedUser);
    });

    it("should throw an error when ChatService.addToGroupChat fails", async () => {
      const req = {
        body: {
          chatId: "chat1",
          userId: "user2",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      const error = new Error("Unable to add user to chat");

      ChatService.addToGroupChat.mockRejectedValue(error);

      try {
        await addToGroupChat(req, res);
      } catch (error) {
        expect(error.message).toBe("Unable to add user to chat");
      }

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledTimes(0);
    });
  });

  describe("removeFromGroupChat", () => {
    it("should remove user from group chat", async () => {
      const req = {
        body: {
          chatId: "chat1",
          userId: "user2",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const removedUser = {
        chatId: "chat1",
        userId: "user2",
      };

      ChatService.removeFromGroupChat.mockResolvedValue(removedUser);

      await removeFromGroupChat(req, res);

      expect(ChatService.removeFromGroupChat).toHaveBeenCalledWith(
        "chat1",
        "user2"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(removedUser);
    });

    it("should throw an error when ChatService.removeFromGroupChat fails", async () => {
      const req = {
        body: {
          chatId: "chat1",
          userId: "user2",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      const error = new Error("Unable to remove user from chat");

      ChatService.removeFromGroupChat.mockRejectedValue(error);

      try {
        await removeFromGroupChat(req, res);
      } catch (error) {
        expect(error.message).toBe("Unable to remove user from chat");
      }

      expect(ChatService.removeFromGroupChat).toHaveBeenCalledWith(
        "chat1",
        "user2"
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
