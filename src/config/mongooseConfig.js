import mongoose from "mongoose";

import postsSchema from "../feautures/posts/posts.schema.js";

const postModel = mongoose.model("Post", postsSchema);

const url = process.env.DB_URL;
export const connectToMongoDB = async () => {
  try {
    await mongoose.connect(url);
    console.log("Mongodb connected using mongoose");
    const count = await postModel.countDocuments();

    if (count === 0) {
      const postsData = [
        {
          author: "Aradya",
          authorId: new mongoose.Types.ObjectId(),
          caption: "Beautiful spring meadow with wild flowers",
          mediaContent:
            "https://img.freepik.com/premium-photo/beautiful-spring-meadow-with-wild-flowers_752237-20390.jpg",
          mediaType: "image/jpg",
          likes: [],
          comments: [],
          bookmarks: [],
        },
        {
          author: "Krish",
          authorId: new mongoose.Types.ObjectId(),
          caption: "Cute three caties",
          mediaContent:
            "https://www.rd.com/wp-content/uploads/2024/06/50-Photos-of-Cute-Kittens-That-Will-Make-You-Melt_GettyImages-187144066_SSedit_FT.jpg",
          mediaType: "image/jpg",
          likes: [],
          comments: [],
          bookmarks: [],
        },
        {
          author: "Krish",
          authorId: new mongoose.Types.ObjectId(),
          caption: "Nandi Hills – Bangalore’s favourite sunrise destination",
          mediaContent:
            "https://theroamingshoes.com/wp-content/uploads/2020/10/DSC_0465.jpg",
          mediaType: "image/jpg",
          likes: [],
          comments: [],
          bookmarks: [],
        },

        {
          author: "Charan",
          authorId: new mongoose.Types.ObjectId(),
          caption: "cute puppy ever",
          mediaContent:
            "https://rukminim2.flixcart.com/image/850/1000/l071d3k0/poster/q/u/k/medium-cute-dogs-cute-puppies-pomeranian-fulffy-dog-golden-original-imagcf8wgyxqkeuf.jpeg",
          mediaType: "image/jpg",
          likes: [],
          comments: [],
          bookmarks: [],
        },
      ];
      await postModel.insertMany(postsData);
    }
  } catch (err) {
    console.log("Error while connecting to mongodb");
    console.log.log(err);
  }
};
