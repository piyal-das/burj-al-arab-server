const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require ('cors');
require('dotenv').config()
console.log(process.env.DB_PASS)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qy62a.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = 5000;


app.use(cors());
app.use(bodyParser.json());


var admin = require("firebase-admin");

var serviceAccount = require("./config/burj-al-arab-e772c-firebase-adminsdk-9tsjp-ba15c16b03.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://burj-al-arab-e772c.firebaseio.com"
});


const pass = 'Arabianhorse95'


const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true , useUnifiedTopology: true});
client.connect(err => {
  const bookings = client.db("burjAlarab").collection("bookings");

  app.get('/bookings', (req, res) => {
    console.log(req.headers.authorization);
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('bearer ')){
        const idToken = bearer.split(' ')[1];
        console.log({idToken});
        // idToken comes from the client app
      admin.auth().verifyIdToken(idToken)
      .then(function(decodedToken) {
        const tokenEmail = decodedToken.email;
        const queryEmail = req.query.email;
        console.log(tokenEmail, queryEmail)
        if(tokenEmail == req.query.email){
          bookings.find({email: req.query.email})
          .toArray((err, documents) => {
            res.send(documents)
          })
        }
      }).catch(function(error) {
        // Handle error
      });
  
    }
else{
  res.status(401).send ('un-authorized access')
}

  })

  app.post ('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
    .then(result =>{
      res.send(result.insertedCount > 0);
    })
    console.log(newBooking);
  })

});



app.get('/', (req, res) => {
    res.send('hello world')
})

app.listen(process.env.PORT || port)