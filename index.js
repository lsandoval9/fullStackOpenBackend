const { response } = require("express");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.json())

app.use(cors())

morgan.token("body", function (req, res) { return JSON.stringify(req.body)});

app.use(morgan( (tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.body(req, res)
      ].join(' ')
}))

let phoneData = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122",
    },
];

app.get("/api/persons", (request, response) => {
    return response.json(phoneData).status(200);
});

app.get("/api/info", (request, response) => {
    let responseString = `
    Phonebook has info for 4 people

    ${new Date()}
    `;

    return response.send(responseString);
});

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);

    if (phoneData.every((person) => person.id !== id)) {
        return response.status(404).send("not found");
    }

    return response.json(phoneData.filter((person) => person.id === id)[0]);
});

app.delete("/api/persons/:id", (request, response) => {




    const id = Number(request.params.id);

    if (phoneData.every((person) => person.id !== id)) {
        return response.status(404).send("not found");
    }


    const filteredPerson = phoneData.filter(person => person.id !== id)

    phoneData = [...filteredPerson]
    
    return response.json(filteredPerson)

});


app.post("/api/persons", (request, response) => {

    

    if (!request.body.name) {
        return response.status(400).send({error: "Please provide a name"});
    }

    if (!request.body.number) {
        return response.status(400).send({error: "Please provide a number"});
    }

    if (phoneData.some(person => person.name === request.body.name)) {
        return response.status(400).json({error: "name must be unique"});
    }

    const newId = (Math.random() * 100000).toFixed(0)

    let newPerson = {
        id: newId,
        name: request.body.name,
        number: request.body.number
    }

    phoneData = [...phoneData, newPerson];

    return response.status(201).send(newPerson)
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
