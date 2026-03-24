import mongoose from 'mongoose';
import likesSchema from './likes.schema.js';
import postsSchema from '../posts/posts.schema.js';

const postsModel = mongoose.model ('post', postsSchema);
const likesModel = mongoose.model ('Like', likesSchema);

export default class LikesRepository {
  async getLikes (userId) {
    const likedPosts = await likesModel.findOne({user: userId});
    const filteredPosts = (await postsModel.find({})).filter(post=>{
      return post.likes.includes(userId)
    })
    return filteredPosts
  }

  async addLike (userId, postId) {
    try {
      const newLike = new likesModel ({user: userId, post: postId}); // No need to cast
      await newLike.save ();
      const likes = await likesModel.countDocuments ({post: postId});

      const post = await postsModel.findById (postId);
      if (post) {
        post.likes.push (newLike.user);
        await post.save ();
      }
      return {success: true, likes: likes};
    } catch (err) {
      return {success: false, error: {statusCode: 400, errorMessage: err}};
    }
  }

  async removeLike (userId, postId) {
    try {
      const like = await likesModel.findOne ({post: postId, user: userId});

      if (like) {
        const likeRemove = await likesModel.deleteOne ({_id: like._id});
        const likes = await likesModel.countDocuments ({post: postId});

        if (likeRemove.deletedCount > 0) {
          const post = await postsModel.findById (postId);
          if (post) {
            post.likes.pull (like.user);
            await post.save ();
          }
          return {success: true, likes: likes};
        }
      }
      return {
        success: false,
        error: {statusCode: 404, errorMessage: 'Like not found'},
      };
    } catch (err) {
      return {success: false, error: {statusCode: 400, errorMessage: err}};
    }
  }

  async toggleLike (userId, postId) {
    const existingLike = await likesModel.findOne ({
      post: postId,
      user: userId,
    });

    return existingLike
      ? this.removeLike (userId, postId)
      : this.addLike (userId, postId);
  }
}
