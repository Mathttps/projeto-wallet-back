import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
import joi from 'joi';
import dayjs from 'dayjs';

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

(async () => {
    try {
        await mongoClient.connect();
        db = mongoClient.db("batepapo-uol");
    } catch (err) {
        console.log(err);
    }
})();

const schemaName = joi.object({
    name: joi.string()
});

const schemaUser = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.string().valid('message', 'private_message').required(),
});

const now = () => dayjs().locale('pt-br').format('HH:mm:ss');

app.post("/participants", async (req, res) => {
    const { body } = req;
    const validation = schemaName.validate(body, { abortEarly: false });
    const user = {
        name: body.name,
        lastStatus: Date.now()
    };
    const message = {
        from: body.name,
        to: 'Todos',
        text: 'entra na sala...',
        type: 'status',
        time: now()
    };

    if (validation.error) {
        const errors = validation.error.details.map(d => d.message);
        res.send(errors);
        return;
    }

    try {
        const isAvailable = await db
            .collection("users")
            .findOne({ name: body.name });

        if (isAvailable) {
            res.status(409).send("Nome de usuário indisponível");
            return;
        }

        await db.collection("users").insertOne(user);
        await db.collection("messages").insertOne(message);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err);
    }
});


app.get("/messages", async (req, res) => {
    const { limit } = req.query;
    const user = req.headers.user;

    try {
        const query = { $or: [{ to: user }, { to: "Todos" }] };
        const messages = await db
            .collection("messages")
            .find(query)
            .toArray();

        if (!limit) {
            res.send(messages);
            return;
        }

        res.send(messages.slice(-limit));
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

app.post("/status", async (req, res) => {
    const user = req.headers.user;

    try {
        const userOn = await db.collection("users").findOne({ name: user });

        if (!userOn) {
            res.sendStatus(404);
            return;
        }

        await db
            .collection("users")
            .updateOne({ name: user }, { $set: { lastStatus: Date.now() } });

        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err);
    }
});

async function userAfk() {
    const now = Date.now();
    const userList = await db
        .collection("users")
        .find({ lastStatus: { $lte: now - 10000 } })
        .toArray();

    const messagesToInsert = userList.map((m) => ({
        from: m.name,
        to: "Todos",
        text: "sai da sala...",
        type: "status",
        time: now,
    }));

    const userNamesToDelete = userList.map((m) => m.name);

    if (messagesToInsert.length > 0) {
        await db.collection("messages").insertMany(messagesToInsert);
    }

    if (userNamesToDelete.length > 0) {
        await db.collection("users").deleteMany({ name: { $in: userNamesToDelete } });
    }
}

setInterval(userAfk, 15000);

app.listen(5000, () => console.log("Server running on port 5000"));
