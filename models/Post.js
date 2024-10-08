import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    text: {
      type: String,
      require: true,
    },
    shortText: {
      type: String,
      require: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    imageUrl: String,
    // Новое поле для комментариев
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment", // Связь с моделью комментариев
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Post", PostSchema);
