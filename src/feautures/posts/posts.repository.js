import mongoose from "mongoose";
import postsSchema from "./posts.schema.js";
import bookmarksSchema from "./bookmarks.schema.js";
import archeivedSchema from "./archievedPosts.schema.js";
import draftsSchema from "./drafts.schema.js";

const postModel = mongoose.model("Post", postsSchema);
const bookmarkModel = mongoose.model("Bookmark", bookmarksSchema);
const archievedModel = mongoose.model("Archieves", archeivedSchema);
const draftModel = mongoose.model("Draft", draftsSchema);

export default class PostsRepository {
  async getPosts() {
    const postsData = await postModel
      .find({})
      .populate("comments", "name content user");
    return postsData;
  }

  async getPostById(postId) {
    const post = await postModel.findById(postId);
    return post;
  }

  async createPost(userName, userId, caption, mediaContent, mediaType) {
    try {
      const post = new postModel({
        author: userName,
        authorId: userId,
        caption: caption,
        mediaContent: "/uploads/posts/" + mediaContent,
        mediaType: mediaType,
        likes: [],
        comments: [],
      });
      await post.save();
      const postsData = await this.getPosts();
      return { success: true, posts: postsData };
    } catch (err) {
      return {
        succes: false,
        error: { statusCode: 400, errorMessage: err.message },
      };
    }
  }

  async getEditPost(postId, authorId) {
    return await postModel.findOne({ _id: postId, authorId: authorId });
  }

  async editPost(postId, authorId, caption, mediaContent, mediaType) {
    const post = await postModel.findOne({ _id: postId, authorId: authorId });
    if (post) {
      post.caption = caption;
      post.mediaContent = "/uploads/posts/" + mediaContent;
      post.mediaType = mediaType;

      await post.save();
      return post;
    }
  }

  async getUserPosts(authorId) {
    const yourPosts = (await postModel.find({})).filter((post) => {
      return post.authorId == authorId;
    });
    return yourPosts;
  }

  async postDelete(postId, authorId) {
    const post = await postModel.deleteOne({ _id: postId, authorId: authorId });
    return post;
  }

  async archievePost(postId, authorId) {
    const post = await postModel.findOne({ _id: postId, authorId: authorId });

    if (post) {
      await postModel.deleteOne({ _id: postId, authorId: authorId });
      const archievePost = new archievedModel({
        postId: post._id,
        author: post.author,
        authorId: post.authorId,
        caption: post.caption,
        mediaContent: post.mediaContent,
        mediaType: post.mediaType,
        likes: post.likes,
        comments: post.comments,
      });
      await archievePost.save();
    }
    return post;
  }

  async getAllArchivedPosts(authorId) {
    const yourArchievedPosts = (await archievedModel.find({})).filter((post) => {
      return post.authorId == authorId;
    });
    return yourArchievedPosts;
  }

  async addBookmark(userId, postId) {
    const post = await postModel.findOne({ _id: postId });
    if (!post) return [];
    const newBookmark = new bookmarkModel({
      post: postId,
      user: userId,
    });
    await newBookmark.save();
    post.bookmarks.push(userId);
    await post.save();
    return await this.getPosts();
  }

  async removeBookmark(userId, postId) {
    const post = await postModel.findOne({ _id: postId });
    if (!post) return [];
    if (post) {
      await bookmarkModel.deleteOne({ post: postId, user: userId });

      post.bookmarks.pull(userId);
      await post.save();
    }
    return await this.getPosts();
  }

  async updateBookmarkStatus(userId, postId) {
    const post = await postModel.findOne({ _id: postId });
    if (!post) return [];
    if (post) {
      if (post.bookmarks.includes(userId)) {
        return await this.removeBookmark(userId, postId);
      } else {
        return await this.addBookmark(userId, postId);
      }
    }
  }

  async getAllBookmarks(userId) {
    const posts = (await bookmarkModel.find({})).filter((post) => {
      return post.bookmarks.includes(userId);
    });
    return posts;
  }

  async addDraft(userId, userName, caption, mediaContent, mediaType) {
    const draft = new draftModel({
      author: userName,
      authorId: userId,
      caption: caption,
      mediaContent: "/uploads/posts/" + mediaContent,
      mediaType: mediaType,
      likes: [],
      comments: [],
      bookmarks: [],
    });
    await draft.save();
    return draft;
  }

  async getAllDrafts(authorId) {
    const yourDrafts = (await draftModel.find({})).filter((post) => {
      return post.authorId == authorId;
    });
    return yourDrafts;
  }

  async sortedPosts(sortby) {
    const postsData = await postModel
      .find({})
      .populate("comments", "name content user");
    if (sortby === "engagement") {
      return postsData.sort((a, b) => {
        const engagementA = a.likes + a.comments.length;
        const engagementB = b.likes + b.comments.length;

        if (engagementB !== engagementA) {
          return engagementB - engagementA;
        }
        return b.createdAt - a.createdAt;
      });
    } else if (sortby === "date") {
      return postsData.sort((a, b) => b.createdAt - a.createdAt);
    }
    return postsData;
  }
}
