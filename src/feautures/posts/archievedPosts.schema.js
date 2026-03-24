import mongoose from 'mongoose';

const archeivedSchema = new mongoose.Schema ({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  author: {
    type: String,
    minLength: [3, 'author should be atleast 3 characters'],
    required: [true, 'Author is required'],
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'authorId is required'],
  },
  caption: {type: String, required: [true, 'Caption is required']},
  mediaContent: {
    type: String,
    required: [true, 'uploaded image is required'],
  },
  mediaType: {type: String, required: [true, 'uploaded image is required']},
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Like',
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bookmark',
    },
  ],
});

export default archeivedSchema;
