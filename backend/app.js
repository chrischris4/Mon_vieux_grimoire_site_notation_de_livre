const express = require('express');

const app = express();

const mongoose = require('mongoose');

const stuffRoutes = require('./routes/stuff');

const userRoutes = require('./routes/user');

const path = require('path');

mongoose.connect('mongodb+srv://chris4:chris4Z-@cluster0.rs4wwe4.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB  réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.get(express.json());

app.use('/api/stuff', stuffRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;