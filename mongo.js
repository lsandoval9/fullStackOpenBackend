const { Schema, model, connect } = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

const url = process.env.MONGODB_URI;

console.log('Connecting to the database');

connect(url).then(() => {
    console.log('App successfully connected');
});

const phonebookSchema = new Schema({
    name: { type: String, uniqueCaseInsensitive: true, minLength: 3 },
    number: { type: String, minLength: 8 },
});

phonebookSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

phonebookSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret, options) => {
        delete ret.__v;
        ret.id = ret._id.toString();
        delete ret._id;
    },
});

phonebookSchema.plugin(uniqueValidator);

const Phonebook = model('Phonebook', phonebookSchema);

module.exports = Phonebook;
