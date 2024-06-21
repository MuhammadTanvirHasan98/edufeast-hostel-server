const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@muhammadcluster.h7migjc.mongodb.net/?retryWrites=true&w=majority&appName=MuhammadCluster`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //  await client.connect();

    const allMealCollection = client.db("eduFeastDB").collection("allMeals");
    const userCollection = client.db("eduFeastDB").collection("users");
    const requestedMealCollection = client.db("eduFeastDB").collection("requestedMeals");
    const reviewCollection = client.db("eduFeastDB").collection("reviews");

    // ---------- Meals related API ---------- //

    // get all meals data from database
    app.get("/allMeals", async (req, res) => {
      const search = req.query.search;
      const category = req.query.category;
      const price = req.query.price;

      let query = {};
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }
      if (category) {
        query.category = category;
      }
      if (price) {
        const [minPrice, maxPrice] = price.split("-").map(Number);
        query.price = { $gte: minPrice, $lte: maxPrice };
      }
      const result = await allMealCollection.find(query).toArray();
      if (result.length === 0) {
        return res.status(204).send();
      }
      res.send(result);
    });

    // get single meal data from database
    app.get("/meal/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allMealCollection.findOne(query);
      res.send(result);
    });


     // get all requested meals of a single user data from database
     app.get("/requestedMeals/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const result = await requestedMealCollection.find({'userInfo.email': email}).toArray();
      res.send(result);
    });


     // Delete specific requested meal of a single user data from database
     app.delete("/requestedMeals/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {_id : new ObjectId(id)}
      const result = await requestedMealCollection.deleteOne(query);
      res.send(result);
    });



    // Save meal request by user in the database
    
    app.post("/requestMeal", async(req,res)=>{
      const mealData = req.body;
      const result = await requestedMealCollection.insertOne(mealData);
      res.send(result);
  })


    // to update likes count of meal data in the database
    app.patch("/meal/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
         $inc: { likes : 1 }
      }
      const result = await allMealCollection.updateOne(query, options);
      res.send(result);
    });


    // ---------- Users related API ---------- //

    // Get specific user by email for user or admin profile info
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // Add user to database when user is created in the client site
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);

      // check whether user exists or not. Insert user only if user does not exist
      const query = { email: user.email };
      const existUser = await userCollection.findOne(query);
      console.log(existUser);
      if (existUser) {
        return res.send({ message: "User already exists!", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });


     

        // ---------- User Reviews related API ---------- //

    
        app.get("/reviews/:id", async(req,res)=>{
          const id = req.params.id;
          console.log({id});
          const query = { mealId: id}
          const result = await reviewCollection.find(query).toArray();
          res.send(result);
      })    

    app.post("/addReview", async(req,res)=>{
        const review = req.body;
        const {mealId} = review;

        console.log("reviews information",review);
        const query = { _id: new ObjectId(mealId)}
        const options ={
           $inc: {reviews: 1}
        }
        const result = await reviewCollection.insertOne(review);
        if(result.insertedId){
          await allMealCollection.updateOne(query, options);
        }
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //  await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("EduFeast Hostel server is running here!");
});

app.listen(port, () => {
  console.log(`My EduFeast Hostel app is listening on port: ${port}`);
});
