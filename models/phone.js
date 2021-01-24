const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;
console.log('connecting to', url);

// DB
mongoose.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  }
).then(result => {
  console.log('connected to MongoDB');
}).catch(error => {
  console.log('error connecting to MongoDB:', error.message);
});

const phoneSchema = new mongoose.Schema({
    name: String,
    date: Date,
    number: String,
});

phoneSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Phone', phoneSchema);
