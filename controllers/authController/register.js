const { User } = require("../../db/userModel");
const { HttpError } = require("../../helpers/index");
const { sendEmail } = require("../../services/email/sendEmail");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const gravatar = require("gravatar");

async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();
    const savedUser = await User.create({
      email,
      password: hashedPassword,
      avatarURL,
      verificationToken,
    });

    await sendEmail({
      to: email,
      subject:
        "Please confirm your email! If it's not you, just ignore this letter.",
      html: `<a href="http://localhost:3000/api/users/verify/${verificationToken}" target="_blank">Confirm your email</a>`,
    });

    return res.status(201).json({
      user: {
        email,
        subscription: savedUser.subscription,
      },
    });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error")) {
      next(HttpError(409, "Email in use"));
    }
    res.json({ message: error.message });
  }
}
module.exports = {
  register,
};
