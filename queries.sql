CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hash_password TEXT NOT NULL,
    photo TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);





CREATE TABLE books (
    id SERIAL PRIMARY KEY,                               -- auto-incrementing unique ID
    title TEXT NOT NULL,                                 -- book title
    author VARCHAR(255),                                 -- author name
    description TEXT,                                    -- optional description
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),  -- rating 1 to 5
    date_read DATE,                                      -- when you finished reading
    notes TEXT,                                          -- personal notes
    isbn VARCHAR(20),                                    -- optional ISBN
    uploaded_by INT REFERENCES users(id) ON DELETE SET NULL  -- who uploaded
);
