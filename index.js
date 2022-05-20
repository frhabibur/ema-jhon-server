const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middlewares 
app.use(cors())
app.use(express.json())


// mongodb config


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7rfi9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("emaJhon").collection("products");
        console.log("connected");

        app.get('/product', async (req, res) => {
            console.log(req.query)
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const searchQuery = {}
            const cursor = productCollection.find(searchQuery)
            let products;
            if (size || page) {
                products = await cursor.skip(page * size).limit(size).toArray()
            }
            else {
                products = await cursor.toArray()
            }
            res.send(products)
        })

        //get data count
        app.get('/productCount', async (req, res) => {
            // const query = {}
            // const cursor = productCollection.find(query)
            const productCount = await productCollection.estimatedDocumentCount()

            res.send({ productCount })

        })

        // use post to get products by id 
        app.post('/productByKeys', async (req, res) => {
            const keys = req.body
            const ids = keys.map(id => ObjectId(id))
            const query = { _id: { $in: ids } }
            const cursor = productCollection.find(query)
            const products = await cursor.toArray()

            res.send(products)
            console.log(query)
        })


    }
    finally {

    }
}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('wellcome to ema-jhon server')
})

app.listen(port, () => {
    console.log('listening port', port)
})