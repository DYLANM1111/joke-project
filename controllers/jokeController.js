const JokeModel = require('../models/jokeModel');

class JokeController {
    static async getCategories(req, res) {
        try {
            const categories = await JokeModel.getCategories();
            if (req.accepts('html')) {
                res.render('categories', { categories });
            } else {
                res.json(categories);
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch categories' });
        }
    }

    static async getJokesByCategory(req, res) {
        try {
            const { category } = req.params;
            const { limit } = req.query;
            let jokes = await JokeModel.getJokesByCategory(category, limit);
            
            if (jokes.length === 0) {
                // Try fetching from external API if category not found
                jokes = await JokeModel.searchExternalAPI(category);
                if (!jokes) {
                    return res.status(404).json({ error: 'Category not found' });
                }
            }

            if (req.accepts('html')) {
                res.render('categoryJokes', { category, jokes });
            } else {
                res.json(jokes);
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch jokes' });
        }
    }

    static async addJoke(req, res) {
        try {
            const { category, setup, delivery } = req.body;
            if (!category || !setup || !delivery) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            const updatedJokes = await JokeModel.addJoke(category, setup, delivery);
            
            if (req.accepts('html')) {
                res.redirect(`/jokebook/joke/${category}`);
            } else {
                res.json(updatedJokes);
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to add joke' });
        }
    }
}

module.exports = JokeController;