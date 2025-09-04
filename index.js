import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000; // Render sets PORT automatically

// ✅ Database connection (works locally & on Render)
const db = new pg.Client({
  connectionString:
    process.env.DATABASE_URL ||
    `postgres://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

await db.connect();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


// Home - list all books
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY id ASC");
    res.render("index.ejs", { book: result.rows });
  } catch (error) {
    console.error(error);
    res.render("index.ejs", { book: [], error: "Something went wrong." });
  }
});

// Show add form
app.get("/new", (req, res) => {
  res.render("new.ejs");
});

// Create a new book
app.post("/create", async (req, res) => {
  const { title, author, isbn, rating, date_read, notes } = req.body;

  try {
    const response = await axios.get(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`
    );
    const results = response.data.docs;

    if (!results || results.length === 0) {
      return res.render("new.ejs", { error: "No book found from OpenLibrary." });
    }

    const book = results[0]; // first result from API

    // Normalize
    const apiTitle = (book.title || "").toLowerCase();
    const apiAuthor = (book.author_name?.[0] || "").toLowerCase();
    const apiIsbn = (book.isbn?.[0] || "").toLowerCase();

    const userTitle = (title || "").toLowerCase();
    const userAuthor = (author || "").toLowerCase();
    const userIsbn = (isbn || "").toLowerCase();

    const isExactMatch =
      apiTitle === userTitle &&
      apiAuthor === userAuthor &&
      apiIsbn === userIsbn;

    // Auto-fill if no exact match
    const finalTitle = isExactMatch ? title : book.title || title;
    const finalAuthor = isExactMatch
      ? author
      : book.author_name
      ? book.author_name[0]
      : author;
    const finalIsbn = isExactMatch
      ? isbn
      : book.isbn
      ? book.isbn[0]
      : isbn;

    await db.query(
      `INSERT INTO books (title, author, rating, date_read, notes, isbn) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [finalTitle, finalAuthor, rating, date_read, notes, finalIsbn]
    );

    res.redirect("/");
  } catch (error) {
    console.error("Error creating book:", error.message);
    res.render("new.ejs", { error: "Something went wrong while saving book." });
  }
});

// Edit book form
app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
    const book = result.rows[0];
    if (!book) {
      return res.render("index.ejs", { book: [], error: "Book not found." });
    }
    res.render("update.ejs", { book });
  } catch (error) {
    console.error(error);
    res.render("index.ejs", { book: [], error: "Something went wrong." });
  }
});

// Update book
app.post("/update", async (req, res) => {
  const { id, title, author, rating, date_read, notes, isbn } = req.body;
  try {
    await db.query(
      `UPDATE books 
       SET title=$1, author=$2, rating=$3, date_read=$4, notes=$5, isbn=$6 
       WHERE id=$7`,
      [title, author, rating, date_read, notes, isbn, id]
    );
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.render("update.ejs", { error: "Failed to update book" });
  }
});

// Delete book
app.post("/delete", async (req, res) => {
  const id = req.body.id;
  try {
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.render("index.ejs", { error: "Error deleting book" });
  }
});


app.listen(port, () => {
  console.log(`✅ Server running on port: ${port}`);
});
