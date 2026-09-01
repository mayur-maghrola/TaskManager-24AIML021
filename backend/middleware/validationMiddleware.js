// Server-side input validation middleware to reject malformed requests before hitting the database

const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body || {};

  if (!username || typeof username !== "string" || username.trim().length < 3) {
    return res.status(400).json({
      error: "Username is required and must be at least 3 characters long.",
    });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      error: "A valid email address is required.",
    });
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      error: "Password is required and must be at least 6 characters long.",
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    return res.status(400).json({
      error: "A valid email address is required for login.",
    });
  }

  if (!password || typeof password !== "string" || password.trim() === "") {
    return res.status(400).json({
      error: "Password is required for login.",
    });
  }

  next();
};

const validateTodo = (req, res, next) => {
  // Support both 'text' and 'title' key for task text
  const taskContent = req.body ? req.body.text || req.body.title : undefined;

  if (
    !taskContent ||
    typeof taskContent !== "string" ||
    taskContent.trim().length < 3
  ) {
    return res.status(400).json({
      error: "Task title/text is required and must be at least 3 characters long.",
    });
  }

  // Normalize request body so downstream handler receives trimmed text
  req.body.text = taskContent.trim();
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTodo,
};
