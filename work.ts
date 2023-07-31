import * as mysql from 'mysql2/promise';
import dayjs from 'dayjs';

var db: mysql.Connection | null = null;
var timeStore: dayjs.Dayjs;


/* Function Init() connects to the database
   DNS must be a valid DSN (see https://pear.php.net/manual/en/package.database.db.intro-dsn.php)
*/
export async function Init(DSN: string) {
    db = await mysql.createConnection(DSN);
}


/* Function Close() disconnects from the current database.
   If not connected, it will do nothing
*/
export function Close() {
    if(db !== null) {
        db.end();
        db = null;
    }
}

/* Function StoreData() stores data in the database.
   data must be an ISO Date string until which the data can be retreived.
   It will return a key which is needed to retreive the data.
*/
export async function StoreData(data: string, until: string): Promise<string> {
    // Generate ID
    let b: Uint8Array = new Uint8Array(33);
    const getRandomValues = require('get-random-values');
    getRandomValues(b);
    let id: string = btoa(String.fromCharCode.apply(null, b));
    id = id.replace(new RegExp("/", "g"), "q");
    id = id.replace(new RegExp("\\+", "g"), "p");

    // Save to DB
    timeStore = dayjs(until);
    let [rows, fields]: [any, any] = await db.execute("INSERT INTO data_store (`id`, `data`, `valid`) VALUES (?,?,?)", [id, data, timeStore.toDate()]);

    // Return ID
    return id;
}

/* Function LoadData() returns data stored in the database as long as the data is valid.
   Data will be valid if today is before the date stored in the database.
   It will return the data or throw an error.
*/
export async function LoadData(key: string): Promise<string> {
    if(db == null) {
        throw Error("DB not initialised");
    }

    let [rows, fields]: [any, any] = await db.execute("SELECT `data`, `valid` FROM data_store WHERE `id`=\"" + key + "\"");
    if(rows.length === 0) {
        throw Error("Unknown key");
    }
    let today: dayjs.Dayjs = dayjs();

    if(today.isAfter(timeStore)) {
        throw Error("Key is not available anymore");
    }
    return rows[0].data;
}