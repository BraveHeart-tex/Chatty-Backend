const MessageService = require("../../services/messageService");
const {
  sendMessage,
  getAllMessages,
} = require("../../controllers/messageController");

jest.mock("../../services/messageService");

describe("sendMessage", () => {
  it("should create a new message and return status 201", async () => {
    const req = {
      user: { _id: "12345" },
      body: { content: "test message", chatId: "54321" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const expectedMessage = {
      _id: "67890",
      sender: "12345",
      content: "test message",
      chat: "54321",
      createdAt: "2022-05-15T12:00:00.000Z",
    };
    MessageService.createMessage.mockResolvedValueOnce(expectedMessage);

    await sendMessage(req, res);

    expect(MessageService.createMessage).toHaveBeenCalledWith(
      req.body.content,
      req.body.chatId,
      req.user._id
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expectedMessage);
  });

  it("should return status 400 when missing content or chatId", async () => {
    const req = { body: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    try {
      await sendMessage(req, res);
    } catch (error) {
      expect(error.message).toBe("Content and chatId are required");
    }

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should throw an error when MessageService.createMessage fails", async () => {
    const req = {
      user: { _id: "12345" },
      body: { content: "test message", chatId: "54321" },
    };
    const res = {
      status: jest.fn(),
    };
    const error = new Error("Failed to create message");
    MessageService.createMessage.mockRejectedValueOnce(error);

    await expect(sendMessage(req, res)).rejects.toThrowError(error);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("getAllMessages", () => {
  it("should return all messages for a given chatId", async () => {
    const req = { params: { chatId: "12345" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const expectedMessages = [
      {
        _id: "67890",
        sender: "12345",
        content: "test message 1",
        chat: "12345",
      },
      {
        _id: "24680",
        sender: "67890",
        content: "test message 2",
        chat: "12345",
      },
      {
        _id: "13579",
        sender: "24680",
        content: "test message 3",
        chat: "12345",
      },
    ];
    MessageService.getAllMessages.mockResolvedValueOnce(expectedMessages);

    await getAllMessages(req, res);

    expect(MessageService.getAllMessages).toHaveBeenCalledWith(
      req.params.chatId
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedMessages);
  });

  it("should throw an error if chatId is not provided", async () => {
    const req = { params: {} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    try {
      await getAllMessages(req, res);
    } catch (error) {
      expect(error.message).toBe("ChatId is required");
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("ChatId is required");
  });

  it("should throw an error if there is an error while retrieving messages", async () => {
    const chatId = "123";
    const errorMsg = "Unable to retrieve messages";
    MessageService.getAllMessages = jest
      .fn()
      .mockRejectedValue(new Error(errorMsg));

    const req = { params: { chatId } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    try {
      await getAllMessages(req, res);
    } catch (error) {
      expect(error.message).toBe(errorMsg);
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledTimes(0);
  });
});
