const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express()
const port = 5000 || process.env.PORT;

//middlewares
app.use(cors())
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@muhammadcluster.h7migjc.mongodb.net/?retryWrites=true&w=majority&appName=MuhammadCluster`;

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
   //  await client.connect();
     

   const allMealCollection = client.db('eduFeastDB').collection('allMeals')



   // get all meals data from database
   app.get('/allMeals', async(req,res)=>{
       const result = await allMealCollection.find().toArray();
       res.send(result);
   })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   //  await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res)=>{
   res.send("EduFeast Hostel server is running here!")
})

app.listen(port, ()=>{
   console.log(`My EduFeast Hostel app is listening on port: ${port}`);
})