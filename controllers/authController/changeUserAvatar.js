const { User } = require("../../db/userModel");
const path = require("path");
const fs = require("fs").promises;
const storeImage = path.join(__dirname, "../../", "public", "avatars");
const Jimp = require("jimp");

const updateUserAvatar = async (req, res, next) => {
  try {
    console.log(process.cwd());
    const { path: temporaryName, originalname } = req.file;

    try {
      const img = await Jimp.read(temporaryName);
      await img.resize(250, 250);
      await img.writeAsync(temporaryName);
    } catch (err) {
      return next(err);
    }

    const id = req.user._id;
    const imageNewName = `${id}_${originalname}`;

    const fileName = path.join(storeImage, imageNewName);

    try {
      await fs.rename(temporaryName, fileName);
    } catch (err) {
      await fs.unlink(temporaryName);
      return next(err);
    }

    const avatarURL = path.join("public", "avatars", imageNewName);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { avatarURL },
      { new: true }
    );

    return res.status(200).json({
      user: {
        avatarURL: updatedUser.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateUserAvatar,
};
