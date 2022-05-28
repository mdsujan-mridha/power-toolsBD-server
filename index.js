const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());





// connect with mongodb 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mnme5.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// verify jwt function
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorizes access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
        // console.log(decoded)
    });

}
async function run() {

    try {

        await client.connect();
        const productsCollection = client.db("products").collection("tools");
        const bookingCollection = client.db("products").collection("bookings");
        const userCollection = client.db("products").collection("users");
        //   get products api 

        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });
        // get a single product 

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query);
            res.send(product);
        });

        // get one single booking item 
        app.get('/bookings', verifyJWT, async (req, res) => {
            const customer = req.query.customer;
            const decodedEmail = req.decoded.email;

            if (customer === decodedEmail) {

                const authorization = req.headers.authorization;
                console.log(authorization);
                const query = { customer: customer };
                const bookings = await bookingCollection.find(query).toArray()
               return res.send(bookings);
            }
            else{
                return res.status(403).send({ message: 'Forbidden access' });
            }

        })
        // booking product api 
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);

        });
        //    get all users 
        app.get('/users', verifyJWT, async(req,res)=>{
             
            const users = await userCollection.find().toArray()
            res.send(users);
        });
        // make admin from any user 
        app.post('/users/admin/:email', async (req, res) => {
            const email = req.params.email;     
            const filter = { email: email };
            const updateDoc = {
                $set: {role: 'admin'},
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);

        });
        // put user in database 
        app.post('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });

        });


    }
    finally {

    }

}
run().catch(console.dir)





app.get('/', (req, res) => {
    res.send("server site is running");
});
app.listen(port, () => {
    console.log("Assingment-12 server is running to port", port);

})