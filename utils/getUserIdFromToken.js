export default () => {
  try {
    // Секретный ключ для верификации токена (используется при создании токена)
    const secretKey = "secret123";
    return jwt.verify(token, secretKey);
  } catch (err) {
    console.log("Ошибка декодирования токена:", err);
    return null;
  }
};
