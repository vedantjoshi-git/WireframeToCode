import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();

let Storage = multer.diskStorage({
  destination: (req, file, callback) => {
    if (!fs.existsSync(`./views/${sender_psid}`)) {
      fs.mkdirSync(`./views/${sender_psid}`);
    }
    callback(null, `./views/${sender_psid}`);
  },
  filename: (res, file, callback) => {
    callback(null, "index.html");
  },
});

let upload = multer({
  storage: Storage,
}).array("htmlUploader", 3);

app.post("/api/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.send("Something went wrong.");
    }
    return res.end("File uploaded successfully! Please close this page.");
  });
});

app.use(express.static(path.join(path.resolve(), "public")));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/uploader", (req, res) => {
  res.render("uploader");
});

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is up and running at http://localhost:" + 8080);
});
