import PostModel from "../models/Post.js";
import getUserIdFromToken from "../utils/getUserIdFromToken.js";
import jwt from "jsonwebtoken";

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate({
        path: "user",
        select: "fullName avatarUrl", // Указываем только нужные поля
      })
      .sort({ createdAt: -1 })
      .exec();

    res.json(posts);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Не удалось ролучить статьи",
    });
  }
};

export const getPopular = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate({
        path: "user",
        select: "fullName avatarUrl", // Указываем только нужные поля
      })
      .sort({ viewsCount: -1 })
      .exec();

    res.json(posts);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Не удалось ролучить статьи",
    });
  }
};

export const getPhoto = async (req, res) => {
  try {
    // Получаем все посты, у которых поле imageUrl существует и не является пустым
    const postsWithPhotos = await PostModel.find({
      imageUrl: { $exists: true, $ne: "" },
    })
      .populate({
        path: "user",
        select: "fullName avatarUrl", // Указываем только нужные поля
      })
      .sort({ viewsCount: -1 })
      .exec();

    res.json(postsWithPhotos);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Не удалось получить посты с фотографиями",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const doc = await PostModel.findByIdAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } },
      { returnDocument: "after" }
    );

    if (!doc) {
      return res.status(404).json({
        message: "Cтатья не найдена",
      });
    }

    res.json(doc);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Не удалось получить статью",
    });
  }
};

export const create = async (req, res) => {
  try {
    const shortText =
      req.body.text.length > 200
        ? req.body.text.substring(0, 200) + " ..."
        : req.body.text;

    console.log(req.body.imageUrl);

    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      shortText,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags,
      user: req.userId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Не удалось создать статью",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    const doc = await PostModel.findByIdAndDelete({ _id: postId });

    if (!doc) {
      return res.status(404).json({
        message: "Статья не найдена",
      });
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Не удалось получить статью",
    });
  }
};

export const update = async (req, res) => {
  try {
    const secretKey = "secret123";

    const userUpdateId = jwt.verify(req.headers.authorization, secretKey)._id;

    const postId = req.params.id;

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Пост не найден",
      });
    }

    const userOwnerPostId = post.user.toString();

    if (userUpdateId !== userOwnerPostId) {
      return res.status(403).json({
        message: "Нет прав на обновление этого поста",
      });
    }

    const shortText =
      req.body.text.length > 200
        ? req.body.text.substring(0, 200) + " ..."
        : req.body.text;

    await PostModel.updateOne(
      { _id: postId },
      {
        title: req.body.title,
        text: req.body.text,
        shortText,
        imageUrl: req.body.imageUrl,
        user: req.body.user,
        tags: req.body.tags,
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Не удалось обновиьт статью",
    });
  }
};
