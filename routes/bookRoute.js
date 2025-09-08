const express = require("express");
const router = express.Router();
const bookController = require("../controller/bookController");
const {ensureAuth} = require("../middleware/auth");

// Routes
router.get("/", bookController.homepage);
router.get("/view-books", bookController.getAllbooks);
router.get("/add-book", ensureAuth, bookController.newBook);   // Show form
router.get("/book/:id", bookController.viewMore);
router.post("/search", bookController.searchBook);// serach for book
router.post("/create", ensureAuth, bookController.addBooks);  // Insert into DB
router.get("/edit/:id", bookController.geteditBooks);
router.get("/my-books", ensureAuth, bookController.myBooks);
router.post("/update", bookController.updateBook);
router.post("/delete", bookController.deleteBooks);

module.exports = router;