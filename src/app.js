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
        db = mongoClient.db();
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


app.listen(5000, () => console.log("Server running on port 5000"));