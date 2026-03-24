import LikesRepository from "./likes.repository.js";
import { CustomErrorHandler } from "../../middlewares/errorHandler.middleware.js";

export default class LikesController {
  constructor() {
    this.likesRepository = new LikesRepository();
  }

  async togglePostLike(req, res, next) {
    try {
      const postId = req.params.postId;
      const userId = req.params.userId;

      const updatedLikes = await this.likesRepository.toggleLike(
        userId,
        postId
      );
      if (updatedLikes.success) {
        res.status(200).json({ likeCount: updatedLikes.likes });
      } else {
        next(
          new CustomErrorHandler(
            updatedLikes.error.statusCode,
            updatedLikes.error.errorMessage
          )
        );
      }
    } catch (err) {
      next();
    }
  }

  async getLikedPosts(req, res, next) {
    const userId = req.params.userId;
    if (res.locals.userId === userId) {
      const { page, limit, startIndex, endIndex } = req.pagination;

      const filteredPostsList = await this.likesRepository.getLikes(userId);
      const filteredPosts = filteredPostsList.slice(startIndex, endIndex);
      const totalFilteredPosts = filteredPostsList.length;
      res.status(200).render("posts", {
        postsData: filteredPosts,
        message: "Below posts are liked by you",
        currentPage: page,
        totalPages: Math.ceil(totalFilteredPosts / limit),
        hasNextPage: endIndex < totalFilteredPosts,
        hasPrevPage: startIndex > 0,
        limit,
      });
    } else {
      next(new CustomErrorHandler(401, "Unauthorized user"));
    }
  }
}
