import mongoose from "mongoose";
import userSchema from "./user.schema.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import friendSchema from "./friends.schema.js";
import OtpRepository from "../otp/otp.repository.js";

const userModel = mongoose.model("User", userSchema);
const friendsModel = mongoose.model("Friends", friendSchema);

export default class UserRepository {
  constructor() {
    this.otpRepository = new OtpRepository();
  }

  async addUser(user) {
    try {
      if (user.avatar != undefined) {
        const newUser = new userModel({
          name: user.name,
          email: user.email,
          password: user.password,
          avatar: "/uploads/avatars/" + user.avatar,
          gender: user.gender,
        });
        await newUser.save();
      } else {
        const newUser = new userModel({
          name: user.name,
          email: user.email,
          password: user.password,
          gender: user.gender,
        });
        await newUser.save();
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: { statusCode: 400, errMsg: err.message },
      };
    }
  }

  async getByEmail(email) {
    try {
      const user = await userModel.findOne({ email: email });
      if (user) {
        const mailTransport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        const otp = await this.otpRepository.generateOtp(email);

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your OTP Code for Password Reset",
          text: `Hi,  

${otp.otp} is your OTP to reset your password. Please do not share it with anyone.  

This OTP is valid for 3 minutes. `,
        };
        await mailTransport.sendMail(mailOptions);
        console.log(`OTP ${otp.otp} sent to ${email}`);
      }

      return user;
    } catch (err) {
      console.log(err);
    }
  }

  async resetPassword(email, newPassword) {
    try {
      const user = await userModel.findOne({ email: email });
      if (user) {
        user.password = newPassword;
        await user.save();
      }
      return { success: true, statusCode: 200 };
    } catch (err) {
      return {
        success: false,
        error: { statusCode: 400, errorMsg: err.message },
      };
    }
  }

  async availableUsers(userId) {
    try {
      const allUsers = await userModel.find({});
      const user = await userModel.findById(userId);
      const friends = await friendsModel.find({
        $or: [{ user1: userId }, { user2: userId }],
      });

      // Extract friend IDs from the `friendsModel`
      const friendIds = friends.map((friend) =>
        friend.user1.toString() === userId.toString()
          ? friend.user2.toString()
          : friend.user1.toString()
      );

      const filteredUsers = allUsers.filter((u) => {
        return (
          !user.requests.includes(u._id.toString()) &&
          !user.pendingRequests.includes(u._id.toString()) &&
          u._id.toString() !== userId.toString() &&
          !friendIds.includes(u._id.toString())
        );
      });
      return filteredUsers || [];
    } catch (err) {
      console.log(err);
    }
  }

  async yourFriends(userId) {
    const friends = await friendsModel
      .find({
        $or: [{ user1: userId }, { user2: userId }],
      })
      .populate("user1 user2");

    const friendsList = await Promise.all(
      friends.map(async (friend) => {
        return friend.user1._id.toString() === userId.toString()
          ? friend.user2
          : friend.user1;
      })
    );
    return friendsList || [];
  }

  async pendingRequests(userId) {
    const user = await userModel.findById(userId).populate("pendingRequests");

    if (!user) return [];

    return user.pendingRequests;
  }

  async friendRequest(senderId, recieverId) {
    try {
      await Promise.all([
        userModel.findByIdAndUpdate(senderId, {
          $push: { pendingRequests: recieverId },
        }),
        userModel.findByIdAndUpdate(recieverId, {
          $push: { requests: senderId },
        }),
      ]);

      return { success: true };
    } catch (err) {
      console.log(err);
    }
  }

  async incomingRequests(userId) {
    const user = await userModel.findById(userId).populate("requests");

    if (!user) return [];

    return user.requests;
  }

  async acceptRequest(userId, reqId) {
    // Check if friendship already

    try {
      const existingFriendship = await friendsModel.findOne({
        $or: [
          { user1: userId, user2: reqId },
          { user1: reqId, user2: userId },
        ],
      });

      if (existingFriendship) {
        return existingFriendship;
      }

      const newFriend = new friendsModel({
        user1: userId,
        user2: reqId,
      });
      await newFriend.save();

      await userModel.findByIdAndUpdate(userId, {
        $pull: { requests: reqId },
      });

      await userModel.findByIdAndUpdate(reqId, {
        $pull: { pendingRequests: userId },
      });

      return newFriend;
    } catch (err) {
      console.log(err);
    }
  }

  async withdrawRequest(userId, reqId) {
    try {
      await userModel.findByIdAndUpdate(userId, {
        $pull: { pendingRequests: reqId },
      });

      await userModel.findByIdAndUpdate(reqId, { $pull: { requests: userId } });

      return newFriend;
    } catch (err) {
      console.log(err);
    }
  }

  async rejectRequest(userId, reqId) {
    try {
      await userModel.findByIdAndUpdate(userId, {
        $pull: { requests: reqId },
      });

      await userModel.findByIdAndUpdate(reqId, {
        $pull: { pendingRequests: userId },
      });

      return { success: true };
    } catch (err) {
      console.log(err);
    }
  }

  async removeFriendship(userId, frndId) {
    try {
      const friendship = await friendsModel.findOneAndDelete({
        $and: [
          { $or: [{ user1: userId }, { user2: userId }] },
          { $or: [{ user1: frndId }, { user2: frndId }] },
        ],
      });

      return { success: true };
    } catch (err) {
      console.log(err);
    }
  }

  async isValidUser(email, password) {
    const user = await userModel.findOne({ email });

    if (!user) return { success: false };

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (isValidPassword) {
      return { success: true, user: user };
    } else {
      return { success: false };
    }
  }

  async getDetailsById(userId) {
    return await userModel.findById(userId);
  }

  async updateProfile(name, email, avatar, gender) {
    try {
      console.log(name, email, avatar, gender);
      let user;
      if (avatar != undefined) {
        user = await userModel.findOneAndUpdate(
          { email: email },
          {
            $set: {
              name: name,
              avatar: "/uploads/avatars/" + avatar,
              gender: gender,
            },
          },
          { new: true }
        );
      } else {
        user = await userModel.findOneAndUpdate(
          { email: email },
          {
            $set: {
              name: name,
              gender: gender,
            },
          },
          { new: true }
        );
      }
      return user;
    } catch (err) {
      return {
        success: false,
        error: { statusCode: 400, errMsg: err.message },
      };
    }
  }
}
