import express from "express";
import ejs from 'ejs';
import session from 'express-session'
import bcrypt from 'bcrypt'
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import MongoDBSession from 'connect-mongodb-session'
const mongoDBSession = MongoDBSession(session)
try{
    await mongoose.connect('mongodb+srv://visweish:visweish03@cluster0.30sjeoa.mongodb.net/?retryWrites=true&w=majority');
    console.log('MongoDB connected!!!')
}catch(e){
    console.log('MongoDB connection error: ', e)
}

const app = express()

const store = new mongoDBSession.create({
    uri: 'mongodb+srv://visweish:visweish03@cluster0.30sjeoa.mongodb.net/?retryWrites=true&w=majority',
    collection: 'sessions'
})

app.use(session({
    secret: 'User Portal',
    resave: false,
    saveUninitialized: true,
    store: store,
}))

const isAuth = (req, res, next)=>{
    if(req.session.user && req.session.isAuth == true){
        next()
    } else{
        res.redirect('/login')
    }
}

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    addedBy: { type: String },
})
const user = mongoose.model('users', userSchema)
let isValid = true

app.use(express.static('public'))
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.render('home', {req: req})
})

app.get('/add', isAuth, (req, res) => {
    res.render('add', {addedBy: req.session.user.email, req: req})
})
app.get('/users', isAuth, async (req, res) => {
    req.session.test = 'Visweish'
    let auth = req.session.user
    let userData = await user.find({addedBy: auth.email})
    res.render('users', { users: userData, req: req})
})

app.post('/save-data', (req, res) => {
    let { name, email, addedBy } = req.body;
    let data = new user({
        name: name,
        email: email,
        addedBy: addedBy,
    })
    data.save()
    res.redirect('/users')
})

app.post('/edit', async (req, res) => {
    let { email } = req.body
    let userData = await user.findOne({ email: email })
    res.render('edit', { user: userData, req: req })
})

app.post('/update', async (req, res) => {
    let { name, oldEmail, email } = req.body
    let data = await user.updateOne({ email: oldEmail },
        {
            $set: {
                name: name,
                email: email,
            }
        })
    res.redirect('/users')
})

app.post('/del', async (req, res) => {
    let { email } = req.body;
    let userData = await user.deleteOne({ email: email })
    res.redirect('/users')
})

app.get('/register', (req, res) => {
    res.render('register', {req: req})
})
let valid = true

app.get('/login', (req, res) => {
    res.render('login', {req: req, error: null})
})

app.post('/register', async (req, res) => {
    let { name, email, password } = req.body
    let data = new user({
        name: name,
        email: email,
        password: await bcrypt.hash(password, 10)
    })
    data.save()
    res.redirect('/login')
})

app.post('/auth', async (req, res) => {
    let { email, password } = req.body;
    let data = await user.findOne({ email: email })
    if (!data) {
        res.render('login', {req: req, error: 'Invalid Email id'})
    }
    else{
        console.log(password)
        console.log(data.password)
        let isPassValid = await bcrypt.compare(password, data.password)
        if (isPassValid) {
            req.session.isAuth = true
            req.session.user = data
            res.redirect('/')
        } else {
            res.render('login', {req: req, error: 'Invalid email id or password'})
        }   

    }
})

app.get('/logout', (req, res)=>{
    req.session.destroy()
    res.redirect('/')
})

app.get('/api-users', async (req, res) => {
    let users = await user.find()
    res.json(users)
})

app.post('/test', (req, res) => {
    res.json('Node is connected with React')
})

app.post('/delete', async (req, res) => {
    let { email } = req.body;
    let userData = await user.deleteOne({ email: email })
    res.redirect('/users')
})

app.listen(8000, () => {
    console.log('Server started')
})