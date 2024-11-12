const express = require('express');
const path = require('path');
const JokeModel = require('./models/jokeModel'); // Add this import
const app = express();
const port = 3000;

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
        res.render('index', { 
            page: 'home', 
            joke: joke || null 
        });
    } catch (error) {
        console.error('Error fetching random joke:', error);
        res.render('index', { 
            page: 'home', 
            joke: null 
        });
    }
});

app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).render('index', { 
        page: 'error', 
        message: 'Something went wrong!' 
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Visit http://localhost:${port} to see the application`);
});