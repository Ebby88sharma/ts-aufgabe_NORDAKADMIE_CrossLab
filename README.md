# Work_test

This project implements a simple storage with deadlines.
Data can only be retreived if the current date has not passed the IdleDeadline

## How to work with the project

### Install packages

```
npm install
```

### Compile

```
npm run build
```

### Run example

```
npm run example
```

### Run unit test

## Task
Write unit tests for the project. All tests should be contained in "work_test.ts".
If you find any bugs, please fix them.

------------------------------------------------------------------------------------

### To run project
1. npm install
2. npm chai
3. If you find any issues with (import dayjs from 'dayjs';) then change import to (import * as dayjs from 'dayjs';). 

Then it should work fine.

### To Run test cases
npm run worktest
npm test

### What was planned
To handle more and possible issues which might occur.

### what has been achieved
1. with given Functions in work.ts {Init, Close, StoreData, LoadData}
2. 8 testcases have been added to work_test.ts and all of them have been running successfully.
3. Most of them were implemented to handle edge cases for these provided functions.
4. No bugs have been found so far. The project ran and still running perfectly.

"# Initial commit" 
