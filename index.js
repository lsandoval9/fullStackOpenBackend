require('dotenv').config();
const Phonebook = require('./mongo.js');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 3001;

const errorHandler = (error, undefined, response, next) => {
    if (error.name === 'CastError') {
        return response
            .status(400)
            .json({ status: 'error', error: 'malformatted id' });
    }
    if (error.name.includes('ValidationError')) {
        return response
            .status(400)
            .json({ error: `validation failed. Reason: ${error.message}` });
    }

    return response.status(500).json({ ...error, error: 'Unknown error' });
};

app.use(express.json());

app.use(cors());

morgan.token('body', function (req, res) {
    return JSON.stringify(req.body);
});

app.use(
    morgan((tokens, req, res) => {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'),
            '-',
            tokens['response-time'](req, res),
            'ms',
            tokens.body(req, res),
        ].join(' ');
    })
);

app.get('/api/persons', (request, response) => {
    Phonebook.find({}).then((result) => {
        return response.json(result).status(200);
    });
});

app.get('/api/info', async (request, response) => {
    const count = await Phonebook.count({});

    let responseString = `
    Phonebook has info for ${count} people

    ${new Date()}
    `;

    return response.send(responseString);
});

app.get('/api/persons/:id', async (request, response, next) => {
    const id = request.params.id;

    try {
        const result = await Phonebook.findById(id);

        if (!result) {
            return response
                .status(400)
                .json({ error: 'Could not find any entry with ID ' + id });
        }

        return response.json(result);
    } catch (error) {
        next(error);
    }
});

app.delete('/api/persons/:id', async (request, response, next) => {
    const id = request.params.id;

    try {
        const result = await Phonebook.findById(id);

        if (!result) {
            return response
                .status(400)
                .json({ error: 'Could not find any entry with ID ' + id });
        }

        await Phonebook.deleteOne(result);

        return response.status(204).json(result);
    } catch (error) {
        next(error);
    }
});

app.post('/api/persons', async (request, response, next) => {
    if (!request.body.name) {
        return response.status(400).send({ error: 'Please provide a name' });
    }

    if (!request.body.number) {
        return response.status(400).send({ error: 'Please provide a number' });
    }

    const repeated = await Phonebook.find({ name: request.body.name });

    /* if (repeated.length !== 0) {
        return response.status(400).json({ error: "name must be unique" })
    } */

    let newPerson = {
        name: request.body.name,
        number: request.body.number,
    };

    try {
        await Phonebook.create(newPerson);

        response.status(201).send(newPerson);
    } catch (error) {
        next(error);
    }
});

app.put('/api/persons/:id', async (request, response, next) => {
    const newNumber = request.body.number;

    const id = request.params.id;

    try {
        let result = await Phonebook.findById(id);

        const newResult = { ...result._doc, number: newNumber };

        if (!result || result.length === 0) {
            return response
                .status(400)
                .json({ error: 'Could not find any entry with ID ' + id });
        }

        await Phonebook.updateOne(result, newResult, { runValidators: true });

        return response.status(204).json(newResult);
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
