import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import UserModel from "../models/User.js";
import handleValidationErrors from "../utils/handleValidationErrors.js";
import { PATH } from "../constants/constants.js";

export const register = async (req, res) => {
  try {
    console.log(req.body);

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log(req.body.avatarUrl);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: hash,
      avatarUrl: "https://via.placeholder.com/300x300?text=Avatar",
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Не удалось зарегестрироваться",
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найлен",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!isValidPass) {
      return res.status(400).json({
        message: "Неверный логин или пароль",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({ ...userData, token });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Не удалось авторизоваться",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Нет доступа",
    });
  }
};

export const updateAuth = async (req, res) => {
  try {
    const secretKey = "secret123";

    // Получение _id из JWT
    const userUpdateId = jwt.verify(req.headers.authorization, secretKey)._id;

    // Новые данные для обновления профиля
    const { fullName, imageUrl } = req.body;
    console.log(imageUrl);

    const imagePath =
      imageUrl === ""
        ? "https://via.placeholder.com/300x300?text=Avatar"
        : PATH + imageUrl;

    // Обновление пользователя в базе данных
    const updatedUser = await UserModel.findByIdAndUpdate(
      userUpdateId,
      { fullName, avatarUrl: imagePath },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    res.json({
      success: true,
      user: updatedUser, // Возвращаем обновлённого пользователя
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Не удалось обновить данные профиля",
    });
  }
};
