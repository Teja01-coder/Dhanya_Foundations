const express = require("express");
const mongoose = require('mongoose')

const authRoutes = require('./routes/authRoutes')
const { approvals } = require('./middlewares/authMiddleware')
const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
app.set("view engine", "ejs");

const dbURI = process.env.MONGODB_URI
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify: false })
    .then(_ =>
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    )
    .catch(err => console.log(err))

app.get("/", (_, res) => res.render("index"));
app.get("/adminpage", approvals, (_, res) => res.render("adminpage"));
app.get("/adminlogin", (_, res) => res.render("adminlogin"));
app.get("/register", (_, res) => res.render("form"));
app.get("/message", (_, res) => res.render("message"));

app.use(authRoutes)
