const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dbConn = require('./config/dbConn');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Connection to MongoDB and Server Initialization
 */
dbConn();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/states', require('./routes/states'));

/**
 * Error Handling
 */
app.all('*', (req, res) => {
	if (req.accepts('html')) {
		res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
	} else if (req.accepts('json')) {
		res.status(404).json({ error: '404 Not Found' });
	} else {
		res.type('txt').status(404).send('404 Not Found');
	}
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
	console.log('Connected to MongoDB');
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
});