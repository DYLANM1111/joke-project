const express = require('express');
const router = express.Router();
const JokeModel = require('../models/jokeModel'); // Note: no destructuring needed


router.get('/categories', async (req, res) => {
    try {
        const categories = await JokeModel.getCategories();
        res.render('index', { page: 'categories', categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.render('index', { page: 'categories', categories: [] });
    }
});

// Show new joke form - This needs to be before the :category route
router.get('/joke/new', (req, res) => {
    res.render('index', { page: 'newJoke' });
});

// Add new joke
router.post('/joke/new', async (req, res) => {
    try {
        const { category, setup, delivery } = req.body;
        if (!category || !setup || !delivery) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const updatedJokes = await JokeModel.addJoke(category, setup, delivery);
        res.json(updatedJokes);
    } catch (error) {
        console.error('Error adding joke:', error);
        res.status(500).json({ error: 'Failed to add joke' });
    }
});

// Get jokes by category
router.get('/joke/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { limit } = req.query;
        let jokes = await JokeModel.getJokesByCategory(category, limit);
        
        if (jokes.length === 0) {
            // Try fetching from external API
            try {
                jokes = await JokeModel.searchExternalAPI(category);
                if (!jokes) {
                    return res.render('index', { 
                        page: 'categoryJokes', 
                        category, 
                        jokes: [],
                        error: 'No jokes found in this category'
                    });
                }
            } catch (apiError) {
                console.error('External API error:', apiError);
                return res.render('index', { 
                    page: 'categoryJokes', 
                    category, 
                    jokes: [],
                    error: 'Failed to fetch external jokes'
                });
            }
        }
        
        res.render('index', { 
            page: 'categoryJokes', 
            category, 
            jokes,
            error: null
        });
    } catch (error) {
        console.error('Error fetching jokes:', error);
        res.render('index', { 
            page: 'categoryJokes', 
            category: req.params.category, 
            jokes: [],
            error: 'Failed to fetch jokes'
        });
    }
});

// Get random joke
router.get('/random', async (req, res) => {
    try {
        const joke = await JokeModel.getRandomJoke();
        if (!joke) {
            return res.status(404).json({ error: 'No jokes found' });
        }
        res.json(joke);
    } catch (error) {
        console.error('Error fetching random joke:', error);
        res.status(500).json({ error: 'Failed to fetch random joke' });
    }
});

module.exports = router;