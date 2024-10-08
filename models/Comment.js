import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Связь с пользователем
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // Связь с постом
      required: true,
    },
  },
  {
    timestamps: true, // Автоматически создаются поля createdAt и updatedAt
  }
);

export default mongoose.model("Comment", CommentSchema);
