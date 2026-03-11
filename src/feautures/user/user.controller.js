import jwt from "jsonwebtoken";
import UserRepository from "./user.repository.js";
import { CustomErrorHandler } from "../../middlewares/errorHandler.middleware.js";

export default class UserController {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(req, res, next) {
    const { name, email, password, gender } = req.body;
    let avatar;
    if (req.file) {
      avatar = req.file.filename;
    } else {
      avatar = undefined;
    }
    try {
      const result = await this.userRepository.addUser({
        name,
        email,
        password,
        avatar,
        gender,
      });
      if (result.success) {
        res.status(200).render("home");
      } else {
        next(
          new CustomErrorHandler(result.error.statusCode, result.error.errMsg)
        );
      }
    } catch (err) {
      next(new CustomErrorHandler(500, "Something went wrong!"));
    }
  }

  getRegister(req, res) {
    res.status(200).render("register");
  }

  getLogin(req, res) {
    res.status(200).render("home");
  }

  async postLogin(req, res, next) {
    const { email, password } = req.body;

    try {
      const result = await this.userRepository.isValidUser(email, password);
      if (result.success) {
        const token = jwt.sign(
          {
            userId: result.user._id,
            userEmail: result.user.email,
            userName: result.user.name,
            avatar: result.user.avatar,
          },
          "CodingNinjas2024",
          { expiresIn: "1h" }
        );
        return res
          .status(201)
          .cookie("jwtToken", token, { maxAge: 900000, httpOnly: true })
          .redirect("/api/post/posts");
      } else {
        return res.render("notFound", {
          errorMessage: "Invalid Credentails.",
        });
      }
    } catch (err) {
      next(new CustomErrorHandler(500, "Something went wrong!"));
    }
  }

  getResetPassword(req, res) {
    res.status(200).render("reset-password");
  }

  async postResetPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await this.userRepository.getByEmail(email);
      if (user) {
        return res.status(200).json({ success: true, email: email });
      } else {
        return res.status(400).json({ success: false });
      }
    } catch (err) {
      next(new CustomErrorHandler(500, "Something went wrong!"));
    }
  }

  async resetPassword(req, res, next) {
    const { mail, newPassword, confirmNewPassword } = req.body;
    try {
      if (newPassword === confirmNewPassword) {
        const result = await this.userRepository.resetPassword(
          mail,
          newPassword
        );
        if (result.success) {
          return res.status(200).json({ success: true });
        } else {
          return res
            .status(result.error.statusCode)
            .json({ success: false, errorMessage: result.error.errorMsg });
        }
      } else {
        return res
          .status(400)
          .json({ success: false, errorMessage: "Passwords should be same" });
      }
    } catch (err) {
      next(new CustomErrorHandler(500, "Something went wrong!"));
    }
  }

  async getUpdateProfile(req, res, next) {
    try {
      const userDetails = await this.userRepository.getUserDetails(
        res.locals.userId
      );
      res.status(200).render("update-profile", { user: userDetails });
    } catch (err) {
      next(new CustomErrorHandler(500, "Something went wrong!"));
    }
  }

  async getAllAvailableUsers(req, res, next) {
    try {
      const users = await this.userRepository.availableUsers(res.locals.userId);
      const friends = await this.userRepository.yourFriends(res.locals.userId);
      const pendingRequests = await this.userRepository.pendingRequests(
        res.locals.userId
      );
      const requests = await this.userRepository.incomingRequests(
        res.locals.userId
      );
      res.status(200).render("requests", {
        suggestions: users,
        friends: friends,
        pendingRequests: pendingRequests,
        incomingRequests: requests,
      });
    } catch (err) {
      next(new CustomErrorHandler(500, "Something went wrong!"));
    }
  }

  async sendRequest(req, res, next) {
    const { recieverId } = req.params;
    const senderId = res.locals.userId;

    try {
      await this.userRepository.friendRequest(senderId, recieverId);
      res.status(200).redirect("/api/user/friend-requests");
    } catch (err) {
      next(new CustomErrorHandler(500, "Something went wrong!"));
    }
  }

  async acceptRequest(req, res, next) {
    const { reqId } = req.params;
    try {
      await this.userRepository.acceptRequest(res.locals.userId, reqId);
      res.status(200).redirect("/api/user/friend-requests");
    } catch (err) {
      next(new CustomErrorHandler(500, "Something went wrong!"));
    }
  }

  async withdrawRequest(req, res, next) {
    const { reqId } = req.params;
    try {
      await this.userRepository.withdrawRequest(res.locals.userId, reqId);
      res.status(200).redirect("/api/user/friend-requests");
    } catch (err) {
      next(new CustomErrorHandler(500, "Something went wrong!"));
    }
  }

  async rejectRequest(req, res, next) {
    const { reqId } = req.params;
    try {
      await this.userRepository.rejectRequest(res.locals.userId, reqId);
      res.status(200).redirect("/api/user/friend-requests");
    } catch (err) {
      next(new CustomErrorHandler(500, "Something went wrong!"));
    }
  }

  async removeFriendship(req, res, next) {
    const { frndId } = req.params;
    try {
      await this.userRepository.removeFriendship(res.locals.userId, frndId);
      res.status(200).redirect("/api/user/friend-requests");
    } catch (err) {
      next(new CustomErrorHandler(500, "Something went wrong!"));
    }
  }

  async editProfile(req, res, next) {
    try {
      const userDetails = await this.userRepository.getDetailsById(
        res.locals.userId
      );
      res.status(200).render("edit-profile", { userDetails: userDetails });
    } catch (err) {
      next(new CustomErrorHandler(500, "Something went wrong!"));
    }
  }

  async postEditProfile(req, res, next) {
    if (res.locals.email) {
      const { name, email, gender } = req.body;
      let avatar;
      if (req.file) {
        avatar = req.file.filename;
      } else {
        avatar = undefined;
      }
      try {
        const user = await this.userRepository.updateProfile(
          name,
          email,
          avatar,
          gender
        );
        const token = jwt.sign(
          {
            userId: user._id,
            userEmail: user.email,
            userName: user.name,
            avatar: user.avatar,
          },
          "CodingNinjas2024",
          { expiresIn: "1h" }
        );
        return res
          .status(201)
          .cookie("jwtToken", token, { maxAge: 900000, httpOnly: true })
          .redirect("/api/post/posts");
      } catch (err) {
        next(new CustomErrorHandler(500, "Something went wrong!"));
      }
    } else {
      next(new CustomErrorHandler(401, "Unauthorized user"));
    }
  }

  logout(req, res) {
    res.clearCookie("jwtToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.status(200).redirect("/");
  }
}

const users = [];
