const ARTICLES = require("../data/articles");

function listArticles(req, res) {
  const { category, q, limit, featured } = req.query;
  let results = [...ARTICLES];

  if (featured === "true") {
    results = results.filter((a) => a.featured === true);
  }

  if (category) {
    const cat = category.toLowerCase();
    results = results.filter((a) => a.category.toLowerCase() === cat);
  }

  if (q) {
    const term = q.toLowerCase();
    results = results.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        a.excerpt.toLowerCase().includes(term) ||
        a.tags.some((t) => t.toLowerCase().includes(term))
    );
  }

  if (limit) {
    const n = parseInt(limit, 10);
    if (!Number.isNaN(n) && n > 0) results = results.slice(0, n);
  }

  // Strip body to keep list payload small; expose all other fields
  const safe = results.map(({ body: _body, ...rest }) => rest);
  res.json(safe);
}

function getArticle(req, res) {
  const article = ARTICLES.find((a) => a.slug === req.params.slug);
  if (!article) return res.status(404).json({ message: "Article not found" });
  res.json(article);
}

module.exports = { listArticles, getArticle };
