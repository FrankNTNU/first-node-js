const express = require('express');
var morgan = require('morgan');
const cors = require('cors');

const app = express();
app.use(cors());

app.use(express.json());
// Configure morgan so that it also shows the data sent in HTTP POST requests:
morgan.token('data', (req, res) => JSON.stringify(req.body));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
);
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};
app.use(requestLogger);

let notes = [
  { id: 1, content: 'HTML is a breeze', important: true },
  { id: 2, content: 'Browser can execute only JavaScript', important: false },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true
  }
];
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (request, response) => {
  response.json(notes);
});

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  const note = notes.find((note) => note.id === id);
  if (note) {
    response.json(note);
  } else {
    response.statusMessage = `Note with id ${id} not found`;
    response.status(404).end();
  }
});

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter((note) => note.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post('/api/notes', (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: 'content missing'
    });
  }

  const note = {
    content: body.content,
    important: Boolean(body.important) || false,
    id: generateId()
  };

  notes = notes.concat(note);

  response.json(note);
});
let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122'
  }
];

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

// show the time that the request was received and how many entries are in the phonebook at the time of processing the request.
app.get('/api/info', (request, response) => {
  const date = new Date();
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`
  );
});
// Implement the functionality for displaying the information for a single phonebook entry. The url for getting the data for a person with the id 5 should be http://localhost:3001/api/persons/5 If an entry for the given id is not found, the server has to respond with the appropriate status code.
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.statusMessage = `Person with id ${id} not found`;
    response.status(404).end();
  }
});
// Implement functionality that makes it possible to delete a single phonebook entry by making an HTTP DELETE request to the unique URL of that phonebook entry.
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  console.log('id', id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});
// Expand the backend so that new phonebook entries can be added by making HTTP POST requests to the address http://localhost:3001/api/persons. Generate a new id for the phonebook entry with the Math.random function. Use a big enough range for your random values so that the likelihood of creating duplicate ids is small.
const generatePersonId = () => {
  let id;
  do {
    id = Math.floor(Math.random() * 1000000);
  } while (persons.some((person) => person.id === id));
  return id;
};
app.post('/api/persons', (request, response) => {
  const body = request.body;
  console.log('body', body);
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    });
  }
  console.log('name', body.name);
  if (persons.some((person) => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    });
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generatePersonId()
  };
  persons = persons.concat(person);
  response.json(person);
});
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
