"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadData = exports.StoreData = exports.Close = exports.Init = void 0;
const mysql = __importStar(require("mysql2/promise"));
const dayjs_1 = __importDefault(require("dayjs"));
var db = null;
var timeStore;
/* Function Init() connects to the database
   DNS must be a valid DSN (see https://pear.php.net/manual/en/package.database.db.intro-dsn.php)
*/
async function Init(DSN) {
    db = await mysql.createConnection(DSN);
}
exports.Init = Init;
/* Function Close() disconnects from the current database.
   If not connected, it will do nothing
*/
function Close() {
    if (db !== null) {
        db.end();
        db = null;
    }
}
exports.Close = Close;
/* Function StoreData() stores data in the database.
   data must be an ISO Date string until which the data can be retreived.
   It will return a key which is needed to retreive the data.
*/
async function StoreData(data, until) {
    // Generate ID
    let b = new Uint8Array(33);
    const getRandomValues = require('get-random-values');
    getRandomValues(b);
    let id = btoa(String.fromCharCode.apply(null, b));
    id = id.replace(new RegExp("/", "g"), "q");
    id = id.replace(new RegExp("\\+", "g"), "p");
    // Save to DB
    timeStore = (0, dayjs_1.default)(until);
    let [rows, fields] = await db.execute("INSERT INTO data_store (`id`, `data`, `valid`) VALUES (?,?,?)", [id, data, timeStore.toDate()]);
    // Return ID
    return id;
}
exports.StoreData = StoreData;
/* Function LoadData() returns data stored in the database as long as the data is valid.
   Data will be valid if today is before the date stored in the database.
   It will return the data or throw an error.
*/
async function LoadData(key) {
    if (db == null) {
        throw Error("DB not initialised");
    }
    let [rows, fields] = await db.execute("SELECT `data`, `valid` FROM data_store WHERE `id`=\"" + key + "\"");
    if (rows.length === 0) {
        throw Error("Unknown key");
    }
    let today = (0, dayjs_1.default)();
    if (today.isAfter(timeStore)) {
        throw Error("Key is not available anymore");
    }
    return rows[0].data;
}
exports.LoadData = LoadData;
