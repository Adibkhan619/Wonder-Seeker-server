const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vfffbgl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// console.log(uri);

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
        await client.connect();

        const touristSpotCollection = client.db("touristSpotDB")
            .collection("touristSpot");
        const countriesCollection = client.db("countriesDB").collection("countries");
        const userCollection = client.db("userDB").collection("users");

        app.get("/users", async (req, res) => {   
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
            console.log("getting users");
        });

        app.get("/countries", async (req, res) => {   
            const cursor = countriesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
            console.log("getting countries");
        });

        app.get("/touristSpots", async (req, res) => {
            const cursor = touristSpotCollection.find().sort({cost: 1});
            const result = await cursor.toArray();
            res.send(result);
            console.log("getting data");
        });

        app.get("/touristSpots/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await touristSpotCollection.findOne(query);
            res.send(result);
        });

        app.post("/touristSpots", async (req, res) => {
            const newSpot = req.body;
            console.log(newSpot);
            const result = await touristSpotCollection.insertOne(newSpot);
            res.send(result);
        });

        app.put("/touristSpots/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedPlace = req.body;
            const place = {
                $set: {
                    image: updatedPlace.image,
                    name: updatedPlace.name,
                    country: updatedPlace.country,
                    location: updatedPlace.location,
                    description: updatedPlace.description,
                    cost: updatedPlace.cost,
                    season: updatedPlace.season,
                    time: updatedPlace.time,
                    visitorPerYear: updatedPlace.visitorPerYear,
                },
            };
            const result = await touristSpotCollection.updateOne(
                filter,
                place,
                options
            );
            res.send(result);
        });

        app.delete("/touristSpots/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await touristSpotCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(port, (req, res) => {
    console.log(`Server is running in port: ${port}`);
});
