const express = require("express");
const router = require("express").Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Post = require("../models/Post");
const User = require("../models/User");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

/* middleware to check if user is logged in */

const authMiddleware = function (req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Unauthorized",
    });
  }
};

/* GET ADMIN - login page */

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "this is the admin page",
    };

    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/* GET ADMIN - check login */

// // basic auth
// router.post("/admin", async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (username === "admin" && password === "admin") {
//       res.send("logged in");
//     } else {
//       res.send("wrong username or password");
//     }
//   } catch (error) {
//     console.log(error);
//   }
// });

/* router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({
        username: username,
        password: hashedPassword,
      });
      res.status(201).json({
        message: "User created successfully",
        user: user,
      });
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({
          message: "Username already exists",
        });
      }
      res.status(500).json({
        message: "Something went wrong. Internal server error",
      });
    }
  } catch (error) {
    console.log(error);
  }
}); */

/* POST Admin - check login */
router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);

    res.cookie("token", token, {
      httpOnly: true,
      // maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

/* GET ADMIN - dashboard */
// authMiddleware protects pages from unauthorized access
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "this is the dashboard",
    };

    const data = await Post.find();

    res.render("admin/dashboard", { locals, data, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/* GET ADMIN - create new post */
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Blog ade using NodeJS, ExpressJS and MongoDB",
    };

    const data = await Post.find();

    res.render("admin/add-post", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/* POST ADMIN - create new post */
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
    });

    await Post.create(newPost);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

/* GET ADMIN - edit post */
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit Post",
      description: "Blog ade using NodeJS, ExpressJS and MongoDB",
    };
    const data = await Post.findOne({ _id: req.params.id });
    res.render("admin/edit-post", { data, locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/* PUT ADMIN - edit post */
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });

    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});

/* DELETE ADMIN - delete post */
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

/* GET ADMIN - logout */
router.get("/logout", async (req, res) => {
  res.clearCookie("token");
  // res.json({
  //   message: "User logged out successfully",
  // });
  res.redirect("/");
});

module.exports = router;
