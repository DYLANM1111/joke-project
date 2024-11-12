const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const dbPath = isProduction ? ':memory:' : path.join(__dirname, '../jokebook.db');
const db = new sqlite3.Database('jokebook.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

function initDatabase() {
    const categories = ['funnyJoke', 'lameJoke'];
    const funnyJokeList = [
        { 'setup': 'Why did the student eat his homework?', 'delivery': 'Because the teacher told him it was a piece of cake!' },
        { 'setup': 'What kind of tree fits in your hand?', 'delivery': 'A palm tree' },
        { 'setup': 'What is worse than raining cats and dogs?', 'delivery': 'Hailing taxis' }
    ];
    const lameJokeList = [
        { 'setup': 'Which bear is the most condescending?', 'delivery': 'Pan-DUH' },
        { 'setup': 'What would the Terminator be called in his retirement?', 'delivery': 'The Exterminator' }
    ];

    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS jokes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            setup TEXT NOT NULL,
            delivery TEXT NOT NULL,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        )`);

        // Insert initial data
        db.get('SELECT COUNT(*) as count FROM categories', [], (err, row) => {
            if (row.count === 0) {
                categories.forEach(category => {
                    db.run('INSERT INTO categories (name) VALUES (?)', [category], function(err) {
                        if (err) return console.error(err);
                        const categoryId = this.lastID;
                        const jokes = category === 'funnyJoke' ? funnyJokeList : lameJokeList;
                        jokes.forEach(joke => {
                            db.run('INSERT INTO jokes (category_id, setup, delivery) VALUES (?, ?, ?)',
                                [categoryId, joke.setup, joke.delivery]);
                        });
                    });
                });
            }
        });
    });
}

module.exports = db;