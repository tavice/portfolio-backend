// Import Dependencies
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

//require dotenv
require("dotenv").config();

const MY_PASSWORD = process.env.MY_PASSWORD;
const MY_EMAIL = process.env.MY_EMAIL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

// Import JSON files
const projects = require("./projects.json");
const about = require("./about.json");

// Create our app object
const app = express();

// set up middleware
app.use(cors());

//home route for testing our app
app.get("/", (req, res) => {
  res.send("Hello World");
});

// route for retrieving projects
app.get("/projects", (req, res) => {
  // send projects via JSON
  res.json(projects);
});

// route for retrieving about info
app.get("/about", (req, res) => {
  // send projects via JSON
  res.json(about);
});

//Google OAuth
// const oauth2Client = new OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URL
// );

// oauth2Client.setCredentials({
//   refresh_token: 'REFRESH_TOKEN'
// });

// const accessToken = oauth2Client.getAccessToken();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     type: 'OAuth2',
//     user: MY_EMAIL,
//     accessToken,
//     clientId: CLIENT_ID,
//     clientSecret: CLIENT_SECRET,
//     refreshToken: 'REFRESH_TOKEN'
//   }
// });





// route for sending emails
//
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/contact", (req, res) => {
  const { name, email, phone, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: MY_EMAIL,
      pass: MY_PASSWORD,
    },
  });

  const mailOptions = { 
    from: email,
    to: "thomasavice.ta@gmail.com",
    subject: "New Contact Form Submission",
    html: `
      <h1>New Contact Form Submission</h1>
      <ul>
        <li>Name: ${name}</li>
        <li>Email: ${email}</li>
        <li>Phone: ${phone}</li>
      </ul>
      <p>${message}</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Oops! Something went wrong.");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Thank you for contacting us!");
    }
  });
});




//declare a variable for our port number
const PORT = process.env.PORT || 4000;

// turn on the server listener
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
