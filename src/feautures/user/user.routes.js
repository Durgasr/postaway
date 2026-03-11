import { avatarUploadFile } from "../../middlewares/avatarUpload.middleware.js";
import UserController from "./user.controller.js";
import express from "express";

const userRouter = express.Router();

const userController = new UserController();

userRouter.post(
  "/signup",
  avatarUploadFile.single("avatar"),
  (req, res, next) => {
    userController.register(req, res, next);
  }
);

userRouter.post("/signin", (req, res, next) => {
  userController.postLogin(req, res, next);
});

userRouter.get("/signin", (req, res) => {
  userController.getLogin(req, res);
});

userRouter.get("/signup", (req, res) => {
  userController.getRegister(req, res);
});

userRouter.get("/reset-password", (req, res) => {
  userController.getResetPassword(req, res);
});

userRouter.post("/reset-password", (req, res) => {
  userController.postResetPassword(req, res);
});


userRouter.put("/set-new-password", (req, res, next) => {
  userController.resetPassword(req, res, next);
});

userRouter.get("/friend-requests", (req, res, next) => {
  userController.getAllAvailableUsers(req, res, next);
});

userRouter.get("/friend-request/:recieverId", (req, res, next) => {
  userController.sendRequest(req, res, next);
});

userRouter.get("/accept-friend-request/:reqId", (req, res, next) => {
  userController.acceptRequest(req, res, next);
});

userRouter.get("/withdraw-friend-request/:reqId", (req, res, next) => {
  userController.withdrawRequest(req, res, next);
});

userRouter.get("/reject-friend-request/:reqId", (req, res, next) => {
  userController.rejectRequest(req, res, next);
});

userRouter.get("/remove-friendship/:frndId", (req, res, next) => {
  userController.removeFriendship(req, res, next);
});

userRouter.get("/edit-profile", (req, res, next) => {
  userController.editProfile(req, res, next);
});

userRouter.post(
  "/edit-profile",
  avatarUploadFile.single("avatar"),
  (req, res, next) => {
    userController.postEditProfile(req, res, next);
  }
);

userRouter.get("/logout", (req, res) => {
  userController.logout(req, res);
});

export default userRouter;
