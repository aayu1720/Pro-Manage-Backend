const User = require("../Schema/user.schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser  = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const isExistingUser  = await User.findOne({ email });

    if (isExistingUser ) {
      return res.status(409).json({
        message: "User  already exists",
        isExistingUser :  true,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = new User({ name, email, password: hashedPassword });

    await userData.save();

    res.json({
      message: "User  registered successfully",
      email: userData.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const loginUser  = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const userDetails = await User.findOne({ email });

    if (!userDetails) {
      return res.status(401).json({ message: "User  does not exist" });
    }

    const passwordMatch = await bcrypt.compare(password, userDetails.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ email: userDetails.email }, process.env.JWT_SECRET_CODE, { expiresIn: "60h" });

    res.json({
      message: "User  logged in",
      UserToken: token,
      email: userDetails.email,
      name: userDetails.name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateUserName = async (req, res, next) => {
  try {
    const email = req.query.email || "";
    const name = req.query.name || "";

    if (!email || !name) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const userDetails = await User.findOne({ email });

    if (!userDetails) {
      return res.status(400).json({ message: "Bad request" });
    }

    await User.updateOne({ email }, { $set: { name } });

    res.json({ message: "Username updated successfully" });
  } catch (error) {
    next(error);
  }
};

const updateUserDetails = async (req, res, next) => {
  try {
    
    const userData = req.body;
    const email = userData.email || "";

    if (!email) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const userDetails = await User.findOne({ email });

    if (!userDetails) {
      return res.status(400).json({ message: "Bad request" });
    }

    const updateData = { name: userData.name, email: userData.email };

    if (userData.oldPassword && userData.newPassword) {
      const passwordMatch = await bcrypt.compare(userData.oldPassword, userDetails.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Password did not match", passwordMatch: false });
      }

      updateData.password = await bcrypt.hash(userData.newPassword, 10);
    }

    await User.updateOne({ email }, { $set: updateData });

    res.json({ message: "User  details updated successfully", updated: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser , loginUser , updateUserName, updateUserDetails };