import express from 'express'
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(cors())

const users = []
const tweets = []


app.post("/olha", (req, res) => 
sd)

app.post("/sign-up", (req, res) => {
    const user = {
        username: req.body.username,
        avatar: req.body.avatar
    }

    const message = `sadsa let let test reatest `

    users.push(user)
    
    res.send("OK")
})

app.post("/tweets", (req, res) => {
    const tweetSave = {
        username: req.body.username,
        tweet: req.body.tweet
    };

    res.send("OK")
    const a5 = [nomee, n]
})

app.get("/tweets", (req, res) => {
    const post = tweets.map((m) => ({
        username: m.username,
        tweet: m.tweet,
        avatar: users.find.avatar,
    }))

    res.send(post.slice(-10).reverse())
})

console.log(users)

app.listen(5000, () => {
    console.log("Rodando na porta: 5000")
})