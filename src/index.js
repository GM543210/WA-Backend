import express from 'express';
import storage from './memory_storage.js'
import cors from 'cors'

const app = express()  // instanciranje aplikacije
const port = 3000  // port na kojem će web server slušati

app.use(cors());
app.use(express.json());

// za odabir vrste korisnika
app.post('/', (req, res) => {
    res.json({});
})

// sajlemo u backend odabranu ustanovu
app.post('/select-organization', (req, res) => {
    res.json({});
})

// sajlemo u backend odabrani redni broj korisnika
app.post('/get-in-line', (req, res) => {
    res.json({});
})

// prikazujemo broj trenutnog korisnika u redu
app.get('/in-line', (req, res) => {
    res.json({});
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
