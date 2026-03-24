import express from 'express';
import LikesController from './likes.controller.js';

const likeRouter = express.Router ();

const likesController = new LikesController ();

likeRouter.post ('/updateLike/:postId/:userId', (req, res, next) => {
  likesController.togglePostLike (req, res, next);
});

likeRouter.get ('/liked-posts/:userId', (req, res, next) => {
  likesController.getLikedPosts (req, res, next);
});

export default likeRouter;
