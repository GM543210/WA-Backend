import {MongoClient} from "mongodb"

let connection_string = "mongodb+srv://admin:admin@cluster0.atqjd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

let client = new MongoClient(connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

let db = null;

export default () => {
    return new Promise((resolve, reject) => {
        client.connect(err => {

            if (db && client.isConnected()) {
                resolve(db)
            }

            if (err) {
                reject("Doslo je do greske prilikom spajanja: " + err);
            } else {
                let db = client.db("ExQs-me")
                resolve(db)
            }
        })
    })
}