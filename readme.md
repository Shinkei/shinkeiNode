## What is this?

Just you wait folks!

## Sample Data

To load sample data, run the following command in your terminal:

```bash
npm run sample
```

If you have previously loaded in this data, you can wipe your database 100% clean with:

```bash
npm run blowitallaway
```

That will populate 16 stores with 3 authors and 41 reviews. The logins for the authors are as follows:

|Name|Email (login)|Password|
|---|---|---|
|Wes Bos|wes@example.com|wes|
|Debbie Downer|debbie@example.com|debbie|
|Beau|beau@example.com|beau|


### Trowbleshooting
> there is an error related with the data base `(node:3840) UnhandledPromiseRejectionWarning: BulkWriteError: E11000 duplicate key error collection: my_db.users index: username_1 dup key: { :null }` something related with a duplicated key, to temporaly solve this error just delete the index in mongo for username_1