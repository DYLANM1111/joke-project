const express = require('express');
const path = require('path');
const app = express();
const JokeModel = require('./models/jokeModel');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const jokeRoutes = require('./routes/jokeRoutes');

app.use('/jokebook', jokeRoutes);

app.get('/', async (req, res) => {
    try {
        const joke = await JokeModel.getRandomJoke();
        res.render('index', { page: 'home', joke });
    } catch (error) {
        console.error('Error:', error);
        res.render('index', { page: 'home', joke: null });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('index', { 
        page: 'error', 
        message: 'Something went wrong!' 
    });
});

module.exports = app;

// Only listen in development
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}