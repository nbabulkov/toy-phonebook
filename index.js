const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Phone = require('./models/phone');

const app = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use(express.static('build'));
app.use(cors());

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>');
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

app.get('/api/phonebook/:id', (request, response, next) => {
  const id = request.params.id;
  Phone.findById(id)
    .then(phone => {
      if (phone) {
        response.json(phone);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

const isObject = obj => (obj !== null && obj !== undefined && typeof obj === 'object');

const validation = person => {
  if (!isObject(person)) {
		return {error: `Invalid object: ${person}`};
  } else if (!('number' in person)) {
    return {error: 'Missing "number" key from object'};
  } else if (!('name' in person)) {
    return {error: `Missing "name" key from object`};
	} else {
		return;
	}
};

app.post('/api/phonebook', (request, response, next) => {
  const person = request.body;
	const error = validation(person);

	if (error) {
		response.status(400).json(error);
  } else {
    const phone = new Phone({
      ...person,
      date: new Date(),
    });
    phone.save()
      .then(saved => response.json(saved))
      .catch(error => next(error));
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

app.put('/api/phonebook/:id', (request, response, next) => {
  const person = request.body;
	const error = validation(person);
  const phoneEntry = {
		...person,
		date: new Date(),
  };
  Phone.findByIdAndUpdate(request.params.id, phoneEntry, { new: true })
    .then(updated => {
      response.json(updated);
    })
    .catch(error => next(error));
});

// handler of requests with unknown endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

// handler of requests with result to errors
const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  next(error);
};
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
