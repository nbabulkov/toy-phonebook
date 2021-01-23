const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());

let phonebook = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '010-532-1111'
  },
  {
    id: 2,
    name: 'Ivan Petrov',
    number: '+359888888888'
  }
];

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
});

app.get('/info', (request, response) => {
  const countPeople = `Phonebook has info for ${phonebook.length} people`;
  const time = new Date().toString();
  console.log(time);
  response.send(`<div>${countPeople}</div></br><div>${time}</div>`);
});

app.get('/api/phonebook', (request, response) => {
    response.json(phonebook)
});

app.get('/api/phonebook/:id', (request, response) => {
  const id = request.params.id;
  const person = phonebook.find(p => p.id == id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

const isObject = obj => (obj !== null && obj !== undefined && typeof obj === 'object');

app.post('/api/phonebook', (request, response) => {
    const maxId = phonebook.length > 0
      ? Math.max(...phonebook.map(n => n.id))
      : 0;

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
    } else if (phonebook.filter(p => p.name === person.name).length > 0) {
      response.status(400).json({
        error: `Name already exists: ${person.name}`
      });
    } else {
      person.id = maxId + 1;
      phonebook = phonebook.concat(person);
      response.json(person);
    }
});

app.delete('/api/phonebook/:id', (request, response) => {
  const id = Number(request.params.id);
  phonebook = phonebook.filter(p => p.id !== id);

  response.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
