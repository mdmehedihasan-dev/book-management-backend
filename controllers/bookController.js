const { ObjectId } = require("mongodb");
const { connectDB } = require("../models/db");

let booksCollection;

(async () => {
  const db = await connectDB();
  booksCollection = db.collection("books");
})();

exports.createBook = async (req, res) => {
  try {
    const book = await booksCollection.insertOne(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const {
      page, limit, genre, minYear, maxYear,
      author, minPrice, maxPrice, sortBy, order, search
    } = req.query;

    const currentPage = Math.max(1, parseInt(page) || 1);
    const perPage = parseInt(limit) || 10;
    const skip = (currentPage - 1) * perPage;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (genre) filter.genre = genre;
    if (minYear || maxYear) {
      filter.publishedYear = {
        ...(minYear && { $gte: parseInt(minYear) }),
        ...(maxYear && { $lte: parseInt(maxYear) })
      };
    }

    if (author) filter.author = { $regex: author, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {
        ...(minPrice && { $gte: parseFloat(minPrice) }),
        ...(maxPrice && { $lte: parseFloat(maxPrice) })
      };
    }

    const sortOptions = { [sortBy || "title"]: order === "desc" ? -1 : 1 };

    const [books, totalBooks] = await Promise.all([
      booksCollection.find(filter).sort(sortOptions).skip(skip).limit(perPage).toArray(),
      booksCollection.countDocuments(filter),
    ]);

    res.json({
      books,
      totalBooks,
      currentPage,
      totalPages: Math.ceil(totalBooks / perPage),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await booksCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const result = await booksCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await booksCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
