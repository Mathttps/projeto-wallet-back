import { usersCollection, sessionsCollection } from "../database/db.js"
import bcrypt from "bcrypt"
import { v4 as uuidV4 } from "uuid"
import joi from 'joi'

const userSchema = joi.object({
    name: joi.string().required(),
    password: joi.string().required(),
    email: joi.string().email().required()
})

const EMAIL_CONFLICT_ERROR = "This email is already registered";
const INVALID_INPUT_ERROR = "Invalid input";
const INCORRECT_EMAIL_ERROR = "Incorrect email";
const INCORRECT_PASSWORD_ERROR = "Incorrect password";
const INTERNAL_SERVER_ERROR = "Internal server error";

export async function login(req, res){
    try {
        const { error, value: user } = userSchema.validate(req.body, { abortEarly: false });
        if(error){
            const errors =error.details.map((d) => d.message);
            return res.status(400).send(errors)
        }

        const userExist = await usersCollection.findOne({ email: user.email });
        if(userExist) {
            return res.status(409).send(EMAIL_CONFLICT_ERROR);
        }
    
        const hashPassword = await bcrypt.hash(user.password, 10);
        await usersCollection.insertOne({ ...user, password: hashPassword });
        
        res.sendStatus(201)
    } catch (err){
        console.log(err)
        res.sendStatus(500).send(INTERNAL_SERVER_ERROR);
    }
}

export async function signIn(req, res){
    try {
        const { email, password } = req.body;
        const userExist = await usersCollection.findOne({ email }); 
        if(!userExist) {
            return res.status(401).send(INCORRECT_EMAIL_ERROR);
        }
        const passwordOk = await bcrypt.compare(password, userExist.password); 
        if(!passwordOk) {
            return res.sendStatus(401).send(INCORRECT_PASSWORD_ERROR);
        }
        const token = uuidV4();
        await sessionsCollection.insertOne({
            token,
            userId: userExist._id
        })
        res.send({ token })
    } catch (err) {
        console.log(err)
        res.sendStatus(500).send(INTERNAL_SERVER_ERROR);
    }
}
