require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Note = require('./models/note');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('build'));

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
    Note.find({}).then(notes => res.json(notes));
});

app.get('/notes/:id', (req, res, next) => {
    Note.findById(req.params.id)
        .then(note => {
            if (note) {
                res.json(note)
            } else {
                res.status(404).end();
            }
        }).catch(error => { next(error) });
});

app.post('/notes', (req, res, next) => { 
    const body = req.body;

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date()
    });

    note.save()
        .then(noteSaved => noteSaved.toJSON())
        .then(savedAndFormattedNote => res.json(savedAndFormattedNote))
        .catch(error => next(error));
});

app.delete('/notes/:id', (req, res, next) => {
    Note.findByIdAndRemove(req.params.id)
        .then(response => {
            res.send(response);
        })
        .catch(error => {
            next(error);
        });
});

app.put('/notes/:id', (req, res, next) => {
    const body = req.body;
    const note = {
        content: body.content, 
        important: body.important
    }

    Note.findByIdAndUpdate(req.params.id, note, {new: true})
        .then(result => {
            res.send(result);
        })
        .catch(error => {
            next(error);
        });
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
};

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' });
    } else if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message });
    }

    next(error);
}
  
app.use(errorHandler);  
app.use(unknownEndpoint);

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});