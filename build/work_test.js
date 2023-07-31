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
Object.defineProperty(exports, "__esModule", { value: true });
const mocha = __importStar(require("mocha"));
const chai_1 = require("chai");
const work_1 = require("./work");
const mysql = __importStar(require("mysql2/promise"));
var TestDSN = "mysql://worktestuser:your_password@localhost/worktest";
mocha.describe("operations.ts", function () {
    this.timeout(10000);
    // Create test DB:
    // CREATE USER 'worktestuser'@localhost IDENTIFIED BY 'test';
    // CREATE DATABASE worktest DEFAULT CHARSET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;
    // GRANT ALL PRIVILEGES ON worktest.* to 'worktestuser'@localhost;
    mocha.before(async function () {
        await (0, work_1.Init)(TestDSN);
    });
    mocha.after(function () {
        (0, work_1.Close)();
    });
    mocha.beforeEach(async function () {
        //this is to create connection before each testcase
        let db = await mysql.createConnection(TestDSN);
        await db.execute("CREATE TABLE data_store (`id` VARCHAR(600) NOT NULL, `data` LONGTEXT NOT NULL, `valid` DATETIME NOT NULL, PRIMARY KEY(`id`));");
        db.end();
    });
    // this is for deleting the table after all the testcases ran
    mocha.afterEach(async function () {
        let db = await mysql.createConnection(TestDSN);
        await db.execute("DROP TABLE data_store;");
        db.end();
    });
    mocha.it("example as test case", async function () {
        let key = await (0, work_1.StoreData)("this is a test", "2224-01-01T00:01");
        let data = await (0, work_1.LoadData)(key);
        if (data !== "this is a test") {
            throw Error("Stored data does not equal test data");
        }
    });
    mocha.it("throw an error if date is not today's date", async function () {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        // For data Storing
        const key = await (0, work_1.StoreData)("this is a test", yesterday.toISOString());
        //If its not today's date then error is expected and data will be loaded 
        try {
            const data = await (0, work_1.LoadData)(key);
            // This testcase must fail if the date is not today's date
            throw new Error("Date is today's date");
        }
        catch (err) {
            // If its not today's date then error must be expected
            (0, chai_1.expect)(err).to.exist;
            (0, chai_1.expect)(err.message).to.equal("Key is not available anymore");
        }
    });
    mocha.it("should throw an error if stored ID does not match the generated ID", async function () {
        // Store some data and fetch ID generated
        const generatedId = await (0, work_1.StoreData)("this is a test", "2224-01-01T00:01");
        // Fetch the ID  from the database 
        let db = await mysql.createConnection(TestDSN);
        const [rows, _] = await db.execute("SELECT `id` FROM `data_store` WHERE `id` = ?", [generatedId]);
        const storedId = rows[0]?.id;
        db.end();
        // Check if the stored ID == the generated ID
        try {
            (0, chai_1.expect)(storedId).to.equal(generatedId);
        }
        catch (err) {
            throw new Error("Stored ID does not match the generated ID");
        }
    });
    mocha.it("should handle storing empty data correctly", async function () {
        // Store empty data
        const key = await (0, work_1.StoreData)("", "2224-01-01T00:01");
        // Fetch the data stored
        const data = await (0, work_1.LoadData)(key);
        // Check if the data stored is empty
        try {
            (0, chai_1.expect)(data).to.equal("");
        }
        catch (err) {
            throw new Error("Stored data is not empty");
        }
    });
    mocha.it("should throw an error when trying to load data with non-existing key", async function () {
        // Try to load data with a key which is not existing
        try {
            const data = await (0, work_1.LoadData)("non-existing-key");
            throw new Error("Data loaded with non-existing key");
        }
        catch (err) {
            (0, chai_1.expect)(err).to.exist;
            (0, chai_1.expect)(err.message).to.equal("Unknown key");
        }
    });
    mocha.it("should generate unique ID for each data entry", async function () {
        //some data storing and generate their keys
        const key1 = await (0, work_1.StoreData)("this is a test", "2224-01-01T00:01");
        const key2 = await (0, work_1.StoreData)("this is another test", "2224-01-01T00:02");
        // Check if there is any difference in keys
        try {
            (0, chai_1.expect)(key1).not.to.equal(key2);
        }
        catch (err) {
            throw new Error("Generated IDs are not unique");
        }
    });
    mocha.it("should store the data until the specified date", async function () {
        // This is Storing data with a date that is not today's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const key = await (0, work_1.StoreData)("this is a test", tomorrow.toISOString());
        try {
            const data = await (0, work_1.LoadData)(key);
            (0, chai_1.expect)(data).to.equal("this is a test");
        }
        catch (err) {
            throw new Error("Data is not available before the valid date");
        }
    });
    mocha.it("implement other test cases here (copy this if needed)", async function () {
    });
});
