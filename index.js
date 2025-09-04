import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";


const app = express();
const port = 4000;
dotenv.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HSOT,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Home route - list books
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY id ASC");
    res.render("index.ejs", { book: result.rows });
  } catch (error) {
    console.error(error);
    res.render("index.ejs", { book: [], error: "Something went wrong." });
  }
});

// Show form
app.get("/new", (req, res) => {
  res.render("new.ejs");
});

// Create a new book (insert into DB)
app.post("/create", async (req, res) => {
  const { title, author, isbn, rating, date_read, notes } = req.body;

  try {
    // 1. Call OpenLibrary API
    const response = await axios.get(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`
    );
    const results = response.data.docs;
    console.log(results)

    if (!results || results.length === 0) {
      return res.render("new.ejs", { error: "No book found from OpenLibrary." });
    }

    // 2. Take the first result
    const book = results[0];

    // 3. Normalize for comparison
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

    // 4. If no exact match, we auto-fill from API
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
    const coverId = book.cover_i || null;

    // 5. Save into DB
    await db.query(
      `INSERT INTO books (title, author, rating, date_read, notes, isbn) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [finalTitle, finalAuthor, rating, date_read, notes, finalIsbn]
    );

    // 6. Redirect to homepage
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
      `UPDATE books SET title=$1, author=$2, rating=$3, date_read=$4, notes=$5, isbn=$6 WHERE id=$7`,
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
  console.log(`Server running on port: ${port}`);
});
