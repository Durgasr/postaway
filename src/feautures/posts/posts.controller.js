import { CustomErrorHandler } from "../../middlewares/errorHandler.middleware.js";
import PostsRepository from "./posts.repository.js";

export default class PostsController {
  constructor() {
    this.postsRepository = new PostsRepository();
  }

  async getAllPosts(req, res, next) {
    try {
      const { page, limit, startIndex, endIndex } = req.pagination;

      if (res.locals.userName !== null) {
        const postsList = await this.postsRepository.getPosts();

        const posts = postsList.slice(startIndex, endIndex);
        const totalPosts = postsList.length;

        res.status(200).render("posts", {
          postsData: posts,
          message: null,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          hasNextPage: endIndex < totalPosts,
          hasPrevPage: startIndex > 0,
          limit,
        });
      } else {
        throw new CustomErrorHandler(401, "Please login to access posts");
      }
    } catch (err) {
      next(err);
    }
  }

  async getEditPost(req, res, next) {
    try {
      const postId = req.params.postId;
      const authorId = req.params.userId;
      const post = await this.postsRepository.getEditPost(postId, authorId);
      if (!post) {
        throw new CustomErrorHandler(404, "You can only edit your own posts.");
      }
      return res.render("update-post", { postData: post });
    } catch (err) {
      next(err);
    }
  }

  async editPost(req, res, next) {
    const { page, limit, startIndex, endIndex } = req.pagination;

    try {
      const postId = req.params.postId;
      const authorId = req.params.userId;
      const mediaContent = req.file.filename;
      const mediaType = req.file.mimetype;
      const { caption } = req.body;

      const post = await this.postsRepository.getEditPost(postId, authorId);
      if (!post) {
        next(new CustomErrorHandler(404, "You can only edit your own posts."));
      }

      await this.postsRepository.editPost(
        postId,
        authorId,
        caption,
        mediaContent,
        mediaType
      );
      const postsList = await this.postsRepository.getPosts();
      if (postsList.length > 3) {
        const posts = postsList.slice(startIndex, endIndex);
        const totalPosts = postsList.length;
        res.status(200).render("your-posts", {
          postsData: posts,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          hasNextPage: endIndex < totalPosts,
          hasPrevPage: startIndex > 0,
          limit,
        });
      } else {
        res.status(200).render("your-posts", {
          postsData: postsList,
        });
      }
    } catch (err) {
      next(err);
    }
  }

  async deletePost(req, res, next) {
    try {
      const postId = req.params.postId;
      const authorId = req.params.userId;
      const post = await this.postsRepository.postDelete(postId, authorId);
      if (!post) {
        throw new CustomErrorHandler(
          404,
          "You can only delete your own posts."
        );
      }
      res.redirect("/api/post/your-posts/" + authorId);
    } catch (err) {
      next(err);
    }
  }

  async getYourOwnPosts(req, res, next) {
    try {
      if (res.locals.userId === req.params.userId) {
        const { page, limit, startIndex, endIndex } = req.pagination;

        const authorId = req.params.userId;
        const postsList = await this.postsRepository.getUserPosts(authorId);
        if (postsList.length > 3) {
          const posts = postsList.slice(startIndex, endIndex);
          const totalPosts = postsList.length;
          res.status(200).render("your-posts", {
            postsData: posts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            hasNextPage: endIndex < totalPosts,
            hasPrevPage: startIndex > 0,
            limit,
          });
        } else {
          res.status(200).render("your-posts", {
            postsData: postsList,
          });
        }
      } else {
        throw new CustomErrorHandler(401, "Unauthorized usser");
      }
    } catch (err) {
      next(err);
    }
  }

  getCreatePost(req, res, next) {
    try {
      res.status(200).render("create-post");
    } catch (err) {
      next(err);
    }
  }

  async postCreate(req, res, next) {
    try {
      const { page, limit, startIndex, endIndex } = req.pagination;

      const { caption } = req.body;
      const mediaContent = req.file.filename;
      const mediaType = req.file.mimetype;
      const result = await this.postsRepository.createPost(
        res.locals.userName,
        res.locals.userId,
        caption,
        mediaContent,
        mediaType
      );

      if (result.success) {
        if (result.posts.length > 3) {
          const posts = result.posts.slice(startIndex, endIndex);
          const totalPosts = result.posts.length;
          return res.status(200).render("posts", {
            postsData: posts,
            message: null,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            hasNextPage: endIndex < totalPosts,
            hasPrevPage: startIndex > 0,
            limit,
          });
        } else {
          return res.status(200).render("posts", {
            postsData: result.posts,
            message: null,
          });
        }
      } else {
        next(
          new CustomErrorHandler(
            result.error.statusCode,
            result.error.errorMessage
          )
        );
      }
    } catch (err) {
      next(err);
    }
  }

  async archivePost(req, res, next) {
    try {
      const { postId, userId } = req.params;
      const post = await this.postsRepository.archievePost(postId, userId);
      if (post) {
        const userPosts = await this.postsRepository.getUserPosts(userId);
        res.status(200).render("your-posts", { postsData: userPosts });
      }
    } catch (err) {
      next(err);
    }
  }

  async getarchivedPosts(req, res, next) {
    try {
      if (res.locals.userId === req.params.userId) {
        const { page, limit, startIndex, endIndex } = req.pagination;

        const authorId = req.params.userId;
        const archivedPostsList =
          await this.postsRepository.getAllArchivedPosts(authorId);
        const archivedPosts = archivedPostsList.slice(startIndex, endIndex);
        const totalPosts = archivedPostsList.length;
        res.status(200).render("posts", {
          postsData: archivedPosts,
          message: "Below posts are archived by you",
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          hasNextPage: endIndex < totalPosts,
          hasPrevPage: startIndex > 0,
          limit,
        });
      } else {
        throw new CustomErrorHandler(401, "Unauthorized user");
      }
    } catch (err) {
      next(err);
    }
  }

  async searchPost(req, res, next) {
    try {
      const { page, limit, startIndex, endIndex } = req.pagination;

      const query = req.body.query.toLowerCase();
      const postsList = await this.postsRepository.getPosts();
      const filteredPostsList = postsList.filter((post) => {
        return (
          post.caption.toLowerCase().includes(query) ||
          post.author.toLocaleLowerCase().includes(query)
        );
      });
      if (filteredPostsList != []) {
        const filteredPosts = filteredPostsList.slice(startIndex, endIndex);
        const totalFilteredPosts = filteredPostsList.length;
        res.status(200).render("posts", {
          postsData: filteredPosts,
          message: null,
          currentPage: page,
          totalPages: Math.ceil(totalFilteredPosts / limit),
          hasNextPage: endIndex < totalFilteredPosts,
          hasPrevPage: startIndex > 0,
          limit,
        });
      } else {
        res.render("posts", { postsData: null });
      }
    } catch (err) {
      next(err);
    }
  }

  async postBookmark(req, res, next) {
    try {
      const { page, limit, startIndex, endIndex } = req.pagination;

      const postId = req.params.postId;
      const userId = req.params.userId;

      const bookmarkList = await this.postsRepository.updateBookmarkStatus(
        userId,
        postId
      );
      if (bookmarkList != []) {
        const bookmarkPosts = bookmarkList.slice(startIndex, endIndex);

        const totalBookmarks = bookmarkList.length;
        res.status(200).render("posts", {
          postsData: bookmarkPosts,
          message: null,
          currentPage: page,
          totalPages: Math.ceil(totalBookmarks / limit),
          hasNextPage: endIndex < totalBookmarks,
          hasPrevPage: startIndex > 0,
          limit,
        });
      } else {
        res.render("posts", { postsData: null });
      }
    } catch (err) {
      next(err);
    }
  }

  async getBookmarks(req, res, next) {
    try {
      const { page, limit, startIndex, endIndex } = req.pagination;

      if (res.locals.userId === req.params.userId) {
        const userId = req.params.userId;

        const filteredBookmarkList = await this.postsRepository.getAllBookmarks(
          userId
        );

        const filteredPosts = filteredBookmarkList.slice(startIndex, endIndex);
        const totalFilteredPosts = filteredBookmarkList.length;
        res.status(200).render("posts", {
          postsData: filteredPosts,
          message: "Below posts are bookmared by you",
          currentPage: page,
          totalPages: Math.ceil(totalFilteredPosts / limit),
          hasNextPage: endIndex < totalFilteredPosts,
          hasPrevPage: startIndex > 0,
          limit,
        });
      } else {
        throw new CustomErrorHandler(401, "Unauthorized user");
      }
    } catch (err) {
      next(err);
    }
  }

  async saveDraft(req, res, next) {
    try {
      const { caption } = req.body;
      const mediaContent = req.file.filename;
      const mediaType = req.file.mimetype;
      const authorId = req.params.userId;
      await this.postsRepository.addDraft(
        req.params.userId,
        res.locals.userName,
        caption,
        mediaContent,
        mediaType
      );

      const userPosts = await this.postsRepository.getUserPosts(authorId);
      res.status(200).render("your-posts", { postsData: userPosts });
    } catch (err) {
      next(err);
    }
  }

  async getDrafts(req, res, next) {
    try {
      if (res.locals.userId === req.params.userId) {
        const { page, limit, startIndex, endIndex } = req.pagination;

        const authorId = req.params.userId;
        const draftsList = await this.postsRepository.getAllDrafts(authorId);
        const drafts = draftsList.slice(startIndex, endIndex);
        const totalDrafts = draftsList.length;
        res.status(200).render("posts", {
          postsData: drafts,
          message: "Below posts are saved as drafts",
          currentPage: page,
          totalPages: Math.ceil(totalDrafts / limit),
          hasNextPage: endIndex < totalDrafts,
          hasPrevPage: startIndex > 0,
          limit,
        });
      } else {
        throw new CustomErrorHandler(401, "Unauthorized user");
      }
    } catch (err) {
      next(err);
    }
  }

  async sortPosts(req, res, next) {
    try {
      const { page, limit, startIndex, endIndex } = req.pagination;
      const sortby = req.params.sortby;
      if (res.locals.userName !== null) {
        const postsList = await this.postsRepository.sortedPosts(sortby);
        const posts = postsList.slice(startIndex, endIndex);
        const totalPosts = postsList.length;
        res.status(200).render("posts", {
          postsData: posts,
          message: null,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          hasNextPage: endIndex < totalPosts,
          hasPrevPage: startIndex > 0,
          limit,
        });
      } else {
        throw new CustomErrorHandler(401, "Please login to access posts");
      }
    } catch (err) {
      next(err);
    }
  }
}
