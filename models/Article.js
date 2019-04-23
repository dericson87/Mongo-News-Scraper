const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  notes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Note'
    }
  ]
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;