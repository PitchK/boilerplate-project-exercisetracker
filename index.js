const express = require('express')
let bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
let mongoose = require('mongoose')


require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


mongoose.connect("mongodb+srv://micaiahcape22:micaiah05@urlshortener.afsxdo4.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) console.log('could not connect');
  console.log('connected');
}) 

let userSchema = new mongoose.Schema({
  name: String,
})

let exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
  rawDate: Number,
})

/*let logSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: [{
    description: String,
    duration: Number,
    date: String,
  }],
})*/

var User = mongoose.model("User", userSchema)
var Exercise = mongoose.model("Exercise", exerciseSchema);

app.post('/api/users', (req, res) => {
  let x = new User({name: req.body.username})
  x.save((err, data) => {
    if (err) return console.log('could not add to database');
    console.log(data);
    res.json({name: req.body.username, _id: data._id})
  })
})

app.post('/api/users/:_id/exercises', (req, res) => {
  User.findOne({_id: req.params._id}, (err, data) => {
    if(err) console.log(err);
    var retrievedName = data.name;
    var d;
    if(req.body.date == ""){
      d = new Date()
    }else{
      d = new Date(req.body.date)
    }
    
    let y = new Exercise({username: data.name, date: d.toDateString(), duration: req.body.duration, description: req.body.description, rawDate: d.getTime()})
    y.save((err, data) => {
      if (err) return console.log(err);
      console.log(data);
      res.json({_id: req.params._id, username: retrievedName, date: d.toDateString(), duration: req.body.duration, description: req.body.description})
    })
  })
})

app.get('/api/users', (req, res) => {
  User.find({}, (err, data) => {
    if (err) return console.log(err);
    res.json(data);
  })
})

var initial;
var final;
var count;

app.get('/api/users/:_id/logs', (req, res) => {
  //path looks like /logs?from=date1&to=date2&limit=number
  //setup
  if(req.query.from == undefined){
    initial = 0;
  }else{
    initial = new Date(req.query.from).getTime();
  }

  if(req.query.to == undefined){
    final = new Date().getTime();
  }else{
    final = new Date(req.query.to).getTime();
  }


  User.findOne({_id: req.params._id}, (err, data) => {
    let d = Exercise.find({username: data.name, rawDate:{$gte: initial, $lte: final}}).limit(req.query.limit).select({description: 1, date: 1, _id: 0, duration: 1}).exec((e, output) => {
      res.json({username: data.name, count: output.length, _id: req.params._id, log: output});
    });

    
    
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
