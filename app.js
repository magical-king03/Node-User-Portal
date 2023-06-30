import express from "express";
import ejs from 'ejs';
import mongoose from "mongoose";
import bodyParser from "body-parser";
mongoose.connect('mongodb+srv://visweish:visweish03@cluster0.30sjeoa.mongodb.net/?retryWrites=true&w=majority').then(
    console.log("MongoDB connected!!!")
)

const app = express()
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
const userSchema = new mongoose.Schema(
    {name: {type: String, required: true},
    email: {type: String, required: true, unique: true}})
const user = mongoose.model('users', userSchema)

app.use(express.static('public'))

app.get('/', (req, res) =>{
    res.render('home')
})

app.get('/add', (req,res) =>{
    res.render('add')
})
app.get('/users', async (req, res) =>{
    let userData = await user.find()
    res.render('users' ,{users : userData})
})

app.post('/save-data', (req, res) =>{
    let {name, email} = req.body;
    let data = new user({
        name: name,
        email: email,
    })
    data.save()
    res.redirect('/users')
})

app.post('/edit', async (req, res) =>{
    let {email} = req.body
    let userData = await user.findOne({email: email})
    res.render('edit' ,{user : userData})
})

app.post('/update', async(req, res)=>{
    let {name, email, oldEmail} = req.body
    let data = await user.updateOne({email: oldEmail},
        {
            $set:{
                name: name,
                email: email,
            }
        })
    res.redirect('/users')
})

app.post('/del', async(req, res)=>{
    let {email} = req.body;
    let userData = await user.deleteOne({email: email})
    res.redirect('/users')
})

app.listen(3000)
console.log('Server started')