import express from 'express';
import storage from './memory_storage.js'
import cors from 'cors'
import dbConnection from './db.js' 
import { restart } from 'nodemon';
import db from './db.js';

const app = express()  // instanciranje aplikacije
const port = 3000  // port na kojem će web server slušati

app.use(cors());
app.use(express.json());

const lastInQueue = []
const queue = []

//registracija admina
app.post('/registration', async (req, res) => { 
    let data = req.body                         
    delete data._id                             

    let db = await dbConnection()
    let result = await db.collection("admins").insertOne(data)

    if (result && result.acknowledged == true) {
        res.json({
            success: "true",
            error: ""
        })
    } else {
        res.json({
            success: "false",
            error: "Insert into mongoDB failed!"
        })
    }
})

//login admina
app.post('/login', async (req, res) => {

    let data = req.body
    let user = null

    if (data.email && data.email.trim() != "" 
        && data. password && data.password.trim() != "") {
        let db = await dbConnection()

        user = await db.collection("admins")
                    .findOne({
                        email: data.email,
                        password: data.password
                    })
    }

    res.json(user)
})

// stvaranje nove institucije
app.post('/institutions/create', async (req, res) => {
    let data = req.body
    delete data._id

    let db = await dbConnection()
    let result = await db.collection("institutions").insertOne(data)

    if (result && result.acknowledged == true) {
        res.json({
            success: "true",
            error: ""
        })
    } else {
        res.json({
            success: "false",
            error: "Insert into mongoDB failed!"
        })
    }
})

//reg ruta, u 2. se parametru poziva fcija s 2 param - request i response
//ispis u browser, odnosno vracanje x podataka u browser - preko http-a odnosno response obj-a
//response ima 2 metode - send i json(slanje pod)

//dohvacanje institucije
app.get('/institutions/get', async (req, res) => { 

    let data = req.query //let data - podatci s kojima cemo raditi, req.query - sadrzi sve parametre
    let institutions = null

    let db = await dbConnection()
    if (data.institution_name && data.institution_name.trim() != "") {
        institutions = await db.collection("institutions")
                    .findOne({
                        institution_name: data.institution_name
                    })
    } else {
        institutions = await db.collection("institutions").find().toArray()
    }

    res.json(institutions) //slanje pod
})
//dohvacanje broja ustanova
app.get('/institutions/size', async (req, res) => {
    let db = await dbConnection()
    let inst_num = await db.collection("institutions").count()
    res.json(inst_num)
})

app.post('/institutions/update', async (req, res) => {

    let data = req.body
    console.log(data)
    let db = await dbConnection()
    await db.collection("institutions")
      .updateOne(
          { institution_name: data.institution_old_name },
          {$set: {
            institution_name: data.institution_name,
            institution_adress: data.institution_adress,
            institution_wh: data.institution_wh,
            branch_office_city: data.branch_office_city,
            avgWait: data.avgWait
          }},
          {upsert: false}
      )

    res.json()
})

//dodavanje usera u red
app.post('/queue/add', async (req, res) => {
    let data = req.body

    let lastNum = lastInQueue.find(i => i.institution_name == data.institution_name)
    if (!lastNum) {
        lastNum = {
            institution_name: data.institution_name,
            index: 1
        }

        lastInQueue.push(lastNum)
    }

    let queueUp = {
        institution_name: data.institution_name,
        queue_number: lastNum.index
    }

    queue.push(queueUp)

    let lastNumIndex = lastInQueue.indexOf(lastNum)
    lastInQueue[lastNumIndex].index += 1
    
    res.json(queueUp.queue_number)
})

//dohvacanje stanja reda za ustanovu
app.get('/queue/size', async (req, res) => {
    let data = req.query
    let num = queue.filter(q => q.institution_name == data.institution_name).length
    res.json(num)
})

//dohvacanje trenutno servirane osobe
app.get('/queue/current', async (req, res) => {
    let data = req.query
    let num = queue.find(q => q.institution_name == data.institution_name).queue_number
    res.json(num)
})

app.get('/queue/state', async (req, res) => {
    let data = req.query

    let current = queue.find(q => q.institution_name == data.institution_name)

    /* let index = queue.indexOf(current)
    queue.splice(index, 1)  */

    let next = queue.find(q => q.institution_name == data.institution_name)

    let size = queue.filter(q => q.institution_name == data.institution_name).length

    let queueState = {
        size,
        current: current != undefined ? current.queue_number : 0,
        next: next != undefined ? next.queue_number : 0 //+1 kod number
    }

    res.json(queueState)
})

app.get('/queue/next', async (req, res) => {
    let data = req.query

    let current = queue.find(q => q.institution_name == data.institution_name)

    let index = queue.indexOf(current)
    queue.splice(index, 1)

    let next = queue.find(q => q.institution_name == data.institution_name)

    let size = queue.filter(q => q.institution_name == data.institution_name).length

    let queueState = {
        size,
        current: current != undefined ? current.queue_number : 0,
        next: next != undefined ? next.queue_number : 0
    }

    res.json(queueState)
})

app.get('/queue/fix', async (req, res) => {
    let data = req.query

    let current = queue.find(q => q.institution_name == data.institution_name)

    let index = queue.indexOf(current)
    queue.splice(index, 1)

    let next = queue.find(q => q.institution_name == data.institution_name)

    let size = queue.filter(q => q.institution_name == data.institution_name).length

    let queueState = {
        size,
        current: current != undefined ? current.queue_number - 1 : 0,
        next: next != undefined ? next.queue_number : 0
    }

    res.json(queueState)
})

// saljemo u backend odabranu ustanovu
app.post('/select-organization', (req, res) => {
    res.json({});
})

// saljemo u backend odabrani redni broj korisnika
app.post('/get-in-line', (req, res) => {
    res.json({});
})

// prikazujemo broj trenutnog korisnika u redu
app.get('/in-line', (req, res) => {
    res.json("Hello from the server");
})

// izbacujemo korisnika iz reda jer je gotov
app.post('/in-line', (req, res) => {
    res.json({});
})

// spremamo na backend promijene informacije ustanove
app.post('/change-organization-info', (req, res) => {
    res.json({});
})

// prikazujemo dal je salter otvoren ili zatvoren
app.get('/manage-window', (req, res) => {
    res.json({});
})

// uzima tko je sljedeci na redu, prikazuje stanje cijelog reda
app.get('/manage-queue', (req, res) => {
    res.json({});
})

// mjenja stanje reda u backendu
app.post('/manage-queue', (req, res) => {
    res.json({});
})

app.listen(port, () => console.log(`Slušam na portu ${port}!`))
//pokrecemo app