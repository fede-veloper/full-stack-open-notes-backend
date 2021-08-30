const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(express.static('build'));

let notes = [
    {
      id: 1,
      content: "HTML is easy",
      date: "2019-05-30T17:30:31.098Z",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only Javascript",
      date: "2019-05-30T18:39:34.091Z",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      date: "2019-05-30T19:20:14.298Z",
      important: true
    }
];

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method);
    console.log('Path:  ', request.path);
    console.log('Body:  ', request.body);
    console.log('---');
    next();
}

app.use(requestLogger);

app.get('/', (req, res) => {
    res.send('Hello world');
});

app.get('/notes', (req, res) => {
    res.json(notes);
});

app.get('/notes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const note = notes.find(note => note.id === id);
    if (note) {
        res.json(note);
    } else {
        res.status(404).end();
    }
});

app.post('/notes', (req, res) => { 
    const body = req.body;

    if (!note.content) {
        return res.status(400).json({error: 'content missing'});
    }

    const note = {
        id: generateId(), 
        content: body.content,
        important: body.important || false,
        date: new Date()
    }

    notes = notes.concat(note);
    res.json(note);
});

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) : 0;
    return maxId + 1;
};

app.delete('/notes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    notes = notes.filter((note) => {note.id !== id});
    res.status(204).end();
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
};
  
app.use(unknownEndpoint);

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});