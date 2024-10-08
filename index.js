import express from "express";
import multer from "multer";
import fs from "fs";
import mongoose from "mongoose";
import cors from "cors";

import {
  registerValidation,
  loginValidation,
  postCreateValidation,
  authUpdateValidation,
} from "./validations.js";

import { checkAuth, handleValidationErrors } from "./utils/index.js";

import {
  UserController,
  PostController,
  CommentController,
} from "./controllers/index.js";

mongoose
  .connect(
    "mongodb+srv://admin:dtQC_tp@cluster0.7jovi.mongodb.net/blog?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("DB ok");
  })
  .catch((err) => {
    console.log("error", err);
  });

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads");
  },
  filename: (_, file, cb) => {
    // Генерируем уникальное имя файла с помощью времени
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // Получаем расширение файла (например, .jpg, .png)
    const extension = file.originalname.split(".").pop();

    // Устанавливаем новое имя файла: имя + уникальный суффикс + расширение
    cb(null, `${file.originalname.split(".")[0]}-${uniqueSuffix}.${extension}`);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("hi world");
});

// AUTH
app.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);
app.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);
app.get("/auth/me", checkAuth, UserController.getMe);
app.patch(
  "/auth",
  checkAuth,
  authUpdateValidation,
  handleValidationErrors,
  UserController.updateAuth
);

// UPLOAD
app.post("/upload", checkAuth, upload.single("image"), (req, res) => {
  const fileName = req.file.filename;
  console.log(fileName);

  res.json({
    url: `/uploads/${fileName}`,
  });
});

// POSTS
app.get("/posts", PostController.getAll);
app.get("/posts/popular", PostController.getPopular);
app.get("/posts/photo", PostController.getPhoto);
app.get("/posts/:id", PostController.getOne);
app.post(
  "/posts",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);
app.delete("/posts/:id", checkAuth, PostController.remove);
app.patch(
  "/posts/:id",
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

// COMMENTS
app.get("/comments/:postId", CommentController.getCommentsByPost);
app.post("/comments", checkAuth, CommentController.addComment);

const port = 3000;
app.listen(port, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(`___!Server OK!___`, "listen port", port);
});
