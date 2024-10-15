const express = require("express");
// const mongoose = require("mongoose");
const env = require("dotenv");

const path = require("path");
const fs = require("fs");
const cors = require("cors");
const user = require("./routes/emailAnduserCountRoutes");

const app = express();
env.config();
const bodyParser = require("body-parser");

const port = process.env.PORT || 3001;



app.use(bodyParser.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// app.post("/file/upload", upload.single("file"), (req, res) => {
//   try {
//     const filePath = req.file.path;
//     const workbook = xlsx.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     const data = xlsx.utils.sheet_to_json(sheet);

//     res.json({ data: data });
//   } catch (err) {
//     console.log(err);
//     res.status(500).send("Error uploading file");
//   }
// });

app.use("/user", user);



app.listen(port, () => {
  console.log("Server is running on port", port);
});