const express = require('express');
const cors = require("cors");
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors())
app.use(express.json())
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qlguchx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const usersCollection = client.db('bistroDb').collection('users')
    const menuCollection = client.db('bistroDb').collection('menu')
    const cartCollection = client.db('bistroDb').collection('carts')

    // user related apis
    app.get('/users', async(req,res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = {email: user.email}
      const existingUser = await usersCollection.findOne(query)
      if(existingUser){
        return res.send({ message: "User already exists"})
      }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })
    app.patch('/users/admin/:id', async(req, res) => {
      const id = req.params.id
      const filter  = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          role: 'Admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })


    // menu related apis
    app.get('/menu', async (req,res) => {
        const result = await menuCollection.find().toArray();
        res.send(result)
    })

    // for the cart operations
    app.get('/carts', async(req,res) => {
      const email = req.query.email
      if(!email){
        res.send([])
      }
      else{
        const query = {email: email}
        const result = await cartCollection.find(query).toArray()
        res.send(result)
      }
    })
    app.post('/carts', async(req,res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);
      res.send(result)
    })
    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await cartCollection.deleteOne(query);
      res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=> {
    res.send('Boss is sitting')
})

app.listen(port, () => {
    console.log('Bistro boss is running on port: ', port)
})