import mongoose from "mongoose";

// id: 1,
// author: 'Durgsri',
// authorId: 1,
// caption: 'Beautiful spring meadow with wild flowers',
// mediaContent: 'https://img.freepik.com/premium-photo/beautiful-spring-meadow-with-wild-flowers_752237-20390.jpg',
// mediaType: 'image/jpg',
// likes: 2,
// comments: [],
// isUserLiked: false,
// isUserBookmarked: false,
// createdAt: new Date ('2025-01-28T14:00:00Z'),

const postsSchema = new mongoose.Schema({
  author: {
    type: String,
    minLength: [3, "author should be atleast 3 characters"],
    required: [true, "Author is required"],
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "authorId is required"],
  },
  caption: { type: String, required: [true, "Caption is required"] },
  mediaContent: {
    type: String,
    required: [true, "uploaded image is required"],
  },
  mediaType: { type: String, required: [true, "uploaded image is required"] },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Like",
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      name: String,
      comment: String,
      ref: "Comment",
    },
  ],
  bookmarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bookmark",
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default postsSchema;
