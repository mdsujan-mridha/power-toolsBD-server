const express = require('express');
const cors = require('cors');
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
 async function run(){

     try{

        await client.connect();
        const productsCollection = client.db("products").collection("tools");
        const bookingCollection = client.db("products").collection("booking");
        //   get products api 

        app.get('/products',async(req,res)=>{
            const query = {}
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });
        // get a single product 

        app.get('/product/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const product = await productsCollection.findOne(query);
            res.send(product);
        });

        // booking product api 
        app.post('/booking',async(req,res)=>{
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);

        })


     }
     finally{

     }

 }
 run().catch(console.dir)





app.get('/', (req,res)=>{
    res.send("server site is running");
});
app.listen(port, ()=>{
    console.log("Assingment-12 server is running to port",port);

})