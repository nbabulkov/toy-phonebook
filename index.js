const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config()

const Phone = require('./models/phone')

const app = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use(express.static('build'));
app.use(cors());

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
});

app.get('/info', (request, response) => {
  Phone.countDocuments({}).then(count => {
    const countPeople = `Phonebook has info for ${count} people`;
    const time = new Date().toString();
    console.log(time);
    response.send(`<div>${countPeople}</div></br><div>${time}</div>`);
  });
});

app.get('/api/phonebook', (request, response) => {
  Phone.find({}).then(phones => response.json(phones));
});

app.get('/api/phonebook/:id', (request, response) => {
  const id = request.params.id;
  Phone.findById(id).then(phone => response.json(phone));
});

const isObject = obj => (obj !== null && obj !== undefined && typeof obj === 'object');

app.post('/api/phonebook', (request, response) => {
    const person = request.body;
    if (!isObject(person)) {
      response.status(400).json({
        error: `Invalid object: ${person}`
      });
    } else if (!('number' in person)) {
      response.status(400).json({
        error: 'Missing "number" key from object'
      });
    } else if (!('name' in person)) {
      response.status(400).json({
        error: `Missing "name" key from object`
      });
    } else {
      const phone = new Phone({
        ...person,
        date: new Date(),
      });
      phone.save().then(saved => response.json(saved));
    }
});

app.delete('/api/phonebook/:id', (request, response, next) => {
  const id = request.params.id;
  Phone.findByIdAndRemove(id)
    .then(result => {
      response.status(204).end();
    })
    .catch(error => next(error));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
