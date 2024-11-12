const db = require('../config/database');

class JokeModel {
    static async getCategories() {
        return new Promise((resolve, reject) => {
            db.all('SELECT name FROM categories', [], (err, rows) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                }
                resolve(rows.map(row => row.name));
            });
        });
    }

    static async getJokesByCategory(category, limit = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT jokes.setup, jokes.delivery 
                FROM jokes 
                JOIN categories ON jokes.category_id = categories.id 
                WHERE categories.name = ?
            `;
            if (limit) query += ` LIMIT ${limit}`;
            
            db.all(query, [category], (err, rows) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                }
                resolve(rows);
            });
        });
    }

    static async addJoke(category, setup, delivery) {
        return new Promise((resolve, reject) => {
            db.get('SELECT id FROM categories WHERE name = ?', [category], (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    return reject(err);
                }
                
                if (!row) {
                    // Create new category if it doesn't exist
                    db.run('INSERT INTO categories (name) VALUES (?)', [category], function(err) {
                        if (err) {
                            console.error('Database error:', err);
                            return reject(err);
                        }
                        insertJoke(this.lastID);
                    });
                } else {
                    insertJoke(row.id);
                }
            });

            function insertJoke(categoryId) {
                db.run('INSERT INTO jokes (category_id, setup, delivery) VALUES (?, ?, ?)',
                    [categoryId, setup, delivery], async (err) => {
                        if (err) {
                            console.error('Database error:', err);
                            return reject(err);
                        }
                        try {
                            const jokes = await JokeModel.getJokesByCategory(category);
                            resolve(jokes);
                        } catch (error) {
                            reject(error);
                        }
                    });
            }
        });
    }

    static async getRandomJoke() {
        return new Promise((resolve, reject) => {
            db.get('SELECT setup, delivery FROM jokes ORDER BY RANDOM() LIMIT 1', [], (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                }
                resolve(row);
            });
        });
    }

    static async searchExternalAPI(category) {
        try {
            const response = await fetch(`https://v2.jokeapi.dev/joke/${category}?type=twopart&amount=3&safe-mode`);
            const data = await response.json();
            if (data.error) return null;

            const jokes = data.jokes || [data];
            for (const joke of jokes) {
                await this.addJoke(category, joke.setup, joke.delivery);
            }
            return await this.getJokesByCategory(category);
        } catch (error) {
            console.error('External API error:', error);
            return null;
        }
    }
}

module.exports = JokeModel;