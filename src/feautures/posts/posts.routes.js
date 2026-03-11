import express from 'express';
import PostsController from './posts.controller.js';
import {uploadFile} from '../../middlewares/fileupload.middleware.js';

const postRouter = express.Router ();

const postController = new PostsController ();

postRouter.get ('/posts', (req, res, next) => {
  postController.getAllPosts (req, res, next);
});

postRouter.get ('/update-post/:postId/:userId', (req, res, next) => {
  postController.getEditPost (req, res, next);
});

postRouter.post (
  '/update/:postId/:userId',
  uploadFile.single ('mediaContent'),
  (req, res, next) => {
    postController.editPost (req, res, next);
  }
);

postRouter.get ('/delete-post/:postId/:userId', (req, res, next) => {
  postController.deletePost (req, res, next);
});

postRouter.get ('/your-posts/:userId', (req, res, next) => {
  postController.getYourOwnPosts (req, res, next);
});

postRouter.get ('/create-post', (req, res, next) => {
  postController.getCreatePost (req, res, next);
});

postRouter.post (
  '/create-post',
  uploadFile.single ('mediaContent'),
  (req, res, next) => {
    postController.postCreate (req, res, next);
  }
);

postRouter.get ('/archive/:postId/:userId', (req, res, next) => {
  postController.archivePost (req, res, next);
});

postRouter.get ('/archived-posts/:userId', (req, res, next) => {
  postController.getarchivedPosts (req, res, next);
});

postRouter.post (
  '/save-draft/:userId',
  uploadFile.single ('mediaContent'),
  (req, res, next) => {
    postController.saveDraft (req, res, next);
  }
);

postRouter.get ('/drafts/:userId', (req, res, next) => {
  postController.getDrafts (req, res, next);
});

postRouter.post ('/search', (req, res, next) => {
  postController.searchPost (req, res, next);
});

postRouter.post ('/bookmark/:postId/:userId', (req, res, next) => {
  postController.postBookmark (req, res, next);
});

postRouter.get ('/bookmarks/:userId', (req, res, next) => {
  postController.getBookmarks (req, res, next);
});

postRouter.get ('/sort-posts/:sortby', (req, res, next) => {
  postController.sortPosts (req, res, next);
});

export default postRouter;
