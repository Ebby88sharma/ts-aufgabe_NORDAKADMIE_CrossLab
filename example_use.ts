import {Init, Close, StoreData, LoadData} from "./work"

// To create user, use:
// CREATE USER 'user'@localhost IDENTIFIED BY 'password';
// GRANT ALL PRIVILEGES ON work.* to 'user'@localhost;

async function example() {
    // Connect to Database
    await Init("mysql://worktestuser:your_password@localhost/worktest");

    // Store some data
    let key: string = await StoreData("this is a test", "2024-01-01T00:01");

    // Load the data
    console.log(await LoadData(key));

    // Now close database
    Close();    
}

example();