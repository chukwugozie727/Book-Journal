CREATE TABLE books (
    id SERIAL PRIMARY KEY,                -- auto-incrementing unique ID
    title TEXT NOT NULL,                  -- book title
    author TEXT,                          -- author name
    rating INT CHECK (rating >= 1 AND rating <= 5), -- rating must be between 1 and 5
    date_read DATE,                       -- when you finished reading
    notes TEXT,                           -- your notes about the book
    isbn VARCHAR(20)                      -- optional ISBN for fetching cover
);
