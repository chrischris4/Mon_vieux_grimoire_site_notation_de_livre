const express = require('express');

const app = express();

app.use((req, res, next) =>{
    console.log('lala')
    next()
})

app.use((req,res,next) =>{
    res.status(201)
    next()
})
app.use((req, res, next) =>{
    res.json({ message: 'lalala la la la'});
    next()
});

app.use((req, res) => {
    console.log('reponse envoyé lala')
})

module.exports = app;