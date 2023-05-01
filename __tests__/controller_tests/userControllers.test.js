const {
  registerUser,
  authUser,
  getAllUsers,
} = require("../../controllers/userControllers");
const UserService = require("../../services/userService");
const { generateToken } = require("../../config/generateToken");
require("dotenv").config();

jest.mock("../../services/userService"); // Mock the UserService module

describe("UserController functions", () => {
  describe("registerUser", () => {
    it("should create a new user and return a token", async () => {
      // Mock the UserService.registerUser method to return a user object
      UserService.registerUser.mockResolvedValueOnce({
        _id: "abc123",
        name: "John Doe",
        email: "johndoe@example.com",
        picture: "https://example.com/johndoe.jpg",
      });

      const req = {
        body: {
          name: "John Doe",
          email: "johndoe@example.com",
          password: "password123",
          picture: "https://example.com/johndoe.jpg",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: "abc123",
        name: "John Doe",
        email: "johndoe@example.com",
        picture: "https://example.com/johndoe.jpg",
        token: generateToken("abc123"),
      });
    });

    it("should return an error if required fields are missing", async () => {
      // Mock the request and response objects
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      try {
        await registerUser(req, res);
      } catch (error) {
        expect(error.message).toBe("Please fill all the fields");
      }

      // Expect the response status to be 400
      expect(res.status).toHaveBeenCalledWith(400);

      // Expect the response JSON to contain the error message
      expect(res.json).toHaveBeenCalledTimes(0);
    });

    it("should return an error if UserService.registerUser throws an error", async () => {
      // Mock the UserService.registerUser method to throw an error
      const mockError = new Error("Registration failed");
      UserService.registerUser.mockRejectedValueOnce(mockError);

      // Mock the request and response objects
      const req = {
        body: {
          name: "John Doe",
          email: "john@example.com",
          password: "password",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Call the controller function
      try {
        await registerUser(req, res);
      } catch (error) {
        expect(error.message).toBe("Registration failed");
      }

      // Expect the response status to be 400
      expect(res.status).toHaveBeenCalledWith(400);

      // Expect the response JSON to contain the error message
      expect(res.json).toHaveBeenCalledTimes(0);
    });
  });

  describe("authUser", () => {
    it("should authenticate a user and return a user object", async () => {
      // Mock the UserService.authUser method to return a user object
      UserService.authUser.mockResolvedValueOnce({
        _id: "123",
        name: "John Doe",
        email: "john@example.com",
        picture: "http://example.com/avatar.png",
      });

      // Mock the request and response objects
      const req = { body: { email: "john@example.com", password: "password" } };
      const res = {
        json: jest.fn(),
      };

      // Call the controller function
      await authUser(req, res);

      // Expect the UserService.authUser method to be called with the correct arguments
      expect(UserService.authUser).toHaveBeenCalledWith(
        "john@example.com",
        "password"
      );

      // Expect the response JSON to match the expected user object
      expect(res.json).toHaveBeenCalledWith({
        _id: "123",
        name: "John Doe",
        email: "john@example.com",
        picture: "http://example.com/avatar.png",
      });
    });
  });

  describe("getAllUsers", () => {
    it("should return a list of users", async () => {
      // Mock the UserService.getAllUsers method to return a list of user objects
      UserService.getAllUsers.mockResolvedValueOnce([
        {
          _id: "123",
          name: "John Doe",
          email: "john@example.com",
          picture: "http://example.com/avatar.png",
        },
        {
          _id: "456",
          name: "Jane Smith",
          email: "jane@example.com",
          picture: "http://example.com/avatar.png",
        },
      ]);

      // Mock the request and response objects
      const req = { query: { search: "john" } };
      const res = {
        json: jest.fn(),
      };

      // Call the controller function
      await getAllUsers(req, res);

      // Expect the UserService.getAllUsers method to be called with the correct argument
      expect(UserService.getAllUsers).toHaveBeenCalledWith("john");

      // Expect the response JSON to match the expected list of user objects
      expect(res.json).toHaveBeenCalledWith([
        {
          _id: "123",
          name: "John Doe",
          email: "john@example.com",
          picture: "http://example.com/avatar.png",
        },
        {
          _id: "456",
          name: "Jane Smith",
          email: "jane@example.com",
          picture: "http://example.com/avatar.png",
        },
      ]);
    });
  });
});
