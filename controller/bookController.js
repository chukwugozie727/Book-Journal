const axios = require("axios");
const db = require("../module/db");

// Homepage
exports.homepage = async (req, res) => {
  try {
    const result =  await db.query("SELECT books.*, users.username AS uploader_name FROM books JOIN users ON books.uploaded_by = users.id");
    // const result = await db.query("SELECT * FROM books ORDER BY id ASC");
    res.render("home.ejs", { 
      book: result.rows , 
      user: req.user });
  } catch (error) {
    console.error(error);
    res.render("home.ejs", { book: [], error: "Something went wrong." });
  }
};

// Search book
exports.searchBook = async (req, res) => {
  let { title } = req.body;
  title = title.trim();
  console.log("Searching for:", title);

  try {
    const result = await db.query(
      "SELECT * FROM books WHERE title ILIKE '%' || $1 || '%'",
      [title]
    );
    const foundBooks = result.rows;

    if (foundBooks.length === 0) {
      return res.render("found.ejs", { book: [], error: "No books found with that title." });
    }

    console.log("Found books:", foundBooks);
    res.render("found.ejs", { book: foundBooks, error: null });

  } catch (error) {
    console.error("Search error:", error.message);
    res.render("found.ejs", {  error: "Something went wrong while searching." });
  }
};





// View more details of a book
exports.viewMore = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
    const book = result.rows[0];

    if (!book) {
      return res.render("more.ejs", { book: null, error: "Book not found." });
    }

    res.render("more.ejs", { book, error: null });
  } catch (error) {
    console.error("View more error:", error.message);
    res.render("more.ejs", { book: null, error: "Something went wrong." });
  }
};

// Get all books
exports.getAllbooks = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY id ASC");
    res.render("index.ejs", { book: result.rows });
  } catch (error) {
    console.error(error);
    res.render("index.ejs", { book: [], error: "Something went wrong." });
  }
};

// Show add new book form
exports.newBook = (req, res) => {
  res.render("new.ejs");
};

// Add new book
exports.addBooks = async (req, res) => {
  const { title, author, isbn, rating, date_read, notes } = req.body;

  try {
    const response = await axios.get(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`
    );
    const results = response.data.docs;

    if (!results || results.length === 0) {
      return res.render("new.ejs", { error: "No book found from OpenLibrary." });
    }

    const book = results[0];

    // Try to fetch description
    let description = null;
    if (book.key) {
      try {
        const detailRes = await axios.get(`https://openlibrary.org${book.key}.json`);
        description = detailRes.data.description
          ? (typeof detailRes.data.description === "string"
              ? detailRes.data.description
              : detailRes.data.description.value)
          : null;
      } catch (err) {
        console.warn("No description found for this book");
      }
    }

    const apiTitle = (book.title || "").toLowerCase();
    const apiAuthor = (book.author_name?.[0] || "").toLowerCase();
    const apiIsbn = (book.isbn?.[0] || "").toLowerCase();

    const userTitle = (title || "").toLowerCase();
    const userAuthor = (author || "").toLowerCase();
    const userIsbn = (isbn || "").toLowerCase();

    const isExactMatch =
      apiTitle === userTitle && apiAuthor === userAuthor && apiIsbn === userIsbn;

    const finalTitle = isExactMatch ? title : book.title || title;
    const finalAuthor = isExactMatch
      ? author
      : book.author_name
      ? book.author_name[0]
      : author;
    const finalIsbn = isExactMatch ? isbn : book.isbn ? book.isbn[0] : isbn;

    const user_id = req.user.id;  // from passport
    console.log(user_id)

    await db.query(
      `INSERT INTO books (title, author, rating, date_read, notes, isbn, description,  uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [finalTitle, finalAuthor, rating, date_read, notes, finalIsbn, description, user_id,]
    );

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error creating book:", error.message);
    res.render("new.ejs", { error: "Something went wrong while saving book." });
  }
};


// // grt my books
// exports.getmyBook = async (req, res) => {
//   res.render("index.ejs")
// }


// my Books
exports.myBooks = async (req, res) => {
  const id = req.user.id
  // const id  = req.body.id
  try {
    const resul = await db.query("SELECT COUNT(*) FROM books WHERE uploaded_by = $1", [id]);
    const bookCount = resul.rows[0].count;

    const result = await db.query("SELECT * FROM books WHERE uploaded_by = $1", [id]);
     const books = result.rows;
    console.log(books + "as how na")
    res.render("index.ejs", {
      books: books,
      bookCount
    })
  } catch (error) {
    console.error(error);
    res.render("index.ejs", { books: [], error: "Something went wrong." });    
  }
}


// Edit form
exports.geteditBooks = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
    const book = result.rows[0];
    if (!book) {
      return res.render("index.ejs", { book: [], error: "Book not found." });
    }
    res.render("update.ejs", { book: book });
  } catch (error) {
    console.error(error);
    res.render("index.ejs", { book: [], error: "Something went wrong." });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  const { title, author, rating, date_read, notes, isbn, id } = req.body;
  try {
    await db.query(
      `UPDATE books 
       SET title=$1, author=$2, rating=$3, date_read=$4, notes=$5, isbn=$6 
       WHERE id=$7`,
      [title, author, rating, date_read, notes, isbn, id]
    );
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.render("update.ejs", { error: "Failed to update book" });
  }
};

// Delete book
exports.deleteBooks = async (req, res) => {
  try {
    const { id } = req.body;
    await db.query("DELETE FROM books WHERE id = $1", [id]);
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting book");
  }
};