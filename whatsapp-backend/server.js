import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

const app = express()
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1561204",
    key: "a4481b17d55c9eb825a4",
    secret: "0c60234b6f0ea5317132",
    cluster: "eu",
    useTLS: true
  });

app.use(express.json());
app.use(cors());


const connection_url = `mongodb+srv://roman19:roman19@cluster0.gansct5.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection

db.once('open', () => {
    console.log('db connected');

    const msgCollection = db.collection('messagecontents')
    const changeStream = msgCollection.watch()

    changeStream.on('change', (change) => {
        console.log(change);

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
            {
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received,
            });
        } else {
            console.log('Error Pusher')
        }
    })
});

app.get('/', (req, res) => res.status(200).send('hello world'))

app.get('/messages/sync', async (req, res) => {
    try {
        const data = await Messages.find();
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/messages/new', async (req, res) => {
    try {
        const dbMessage = req.body;
        const data = await Messages.create(dbMessage);
        res.status(201).send(data);
    } catch (error) {
        res.status(500).send(error);
    }
});


app.listen(port, ()=>console.log(`listening on ${port}`))