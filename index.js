import fs from "fs";
import request from "request";
import express from "express";
import https from "https";
import multer from "multer";
import path from "path";
import sendEmail from "./mailer.js";
// import wireCode from "./wireCode.js";
const app = express().use(express.json());

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

app.get("/", (_req, res) => {
  res.render("index");
});

app.get("/uploader", (_req, res) => {
  res.render("uploader");
});

//webhook endpoint for facebook messenger
app.post("/webhook", (req, res) => {
  let body = req.body;

  if (body === "page") 
  {
    body.entry.forEach(function (entry) {
      let webhook_event = entry.messaging[0];
      global.sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event);

      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      } 
    });
    res.sendStatus(200).send('Event Received');
  }
  else 
  {
    res.sendStatus(404);
  }
});

// Adds support for GET request to our webhook
app.get("/webhook", (req, res) => {
  let VERIFY_TOKEN = "";

  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

function handleMessage(webhook_event, sender_psid) {
  let messages;
  let received_message = webhook_event.message;

  if (received_message.text) {
    var text = received_message.text.trim().toLowerCase();
    if (text.includes("hi") || text.includes("hello")) {
      response = {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: "Hi! I'm a bot. I can help you to create a deployed website of your wireframe image.Say 'hi' or 'hello' to start",
            buttons: [
              {
                type: "postback",
                payload: "TRANSLATE",
                title: "Image to Code",
              },
              {
                type: "postback",
                payload: "UPLOAD",
                title: "Upload a WebSite",
              },
              {
                type: "postback",
                payload: "LINK",
                title: "View My Link",
              },
            ],
          },
        },
      };
    } else if (text.includes("@")) {
      // handlePostback(sender_psid, START)
      em_send = text;
      response = {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: `We received: "${text}". Is that correct?`,
            buttons: [
              {
                type: "postback",
                payload: "YES_EMAIL",
                title: "Yes",
              },
              {
                type: "postback",
                payload: "NO",
                title: "No",
              },
            ],
          },
        },
      };
    } else if (text.includes("run")) {
      response = { text: `We are processing your image!` };
    } else {
      response = {
        text: `Sorry, we cannot recognize "${text}" at this moment.`,
      };
    }
  } else if (received_message.attachments) {
    att = webhook_event.message.attachments[0].payload.url;
    if (!fs.existsSync(`./wireFrames/${sender_psid}`)) {
      fs.mkdirSync(`./wireFrames/${sender_psid}`);
    }
    filePath = `wireFrames/${sender_psid}/sample.jpg`;
    file = fs.createWriteStream(filePath);
    var request = https.get(att, async function (response) {
      response.pipe(file);
      file.on("close", function (err) {
        if (err) {
          console.log(err);
        }
      });
    });
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "We received your image! Press run to Build an initial HTML & CSS Code from it.",
          buttons: [
            {
              type: "postback",
              payload: "RUN",
              title: "Run",
            },
          ],
        },
      },
    };
  }
  // Send the response message
  callSendAPI(sender_psid, response);
}




// async function myC(sender_psid) {
//   let response;
//   var data = fs.readFileSync(`./wireFrames/${sender_psid}/sample.jpg`);
//   try {
//     results = await wireCode(data);
//   } catch (e) {
//     console.log(e);
//   } finally {
//     //console.log('We do cleanup here');
//   }
//   if (!fs.existsSync(`./views/${sender_psid}`)) {
//     fs.mkdirSync(`./views/${sender_psid}`);
//   }
//   fs.writeFile(
//     `./views/${sender_psid}/sample.html`,
//     results.generated_webpage_html,
//     "utf8",
//     function (err) {
//       if (err) {
//         console.log("An error occured while writing JSON Object to File.");
//         return console.log(err);
//       }
//       console.log("HTML file has been saved.");
//     }
//   );

//   fs.writeFile(
//     `./views/${sender_psid}/autocodeai-form.css`,
//     results.generated_webpage_css,
//     "utf8",
//     function (err) {
//       if (err) {
//         console.log("An error occured while writing JSON Object to File.");
//         return console.log(err);
//       }
//       console.log("CSS file has been saved.");
//     }
//   );
//   response = {
//     attachment: {
//       type: "template",
//       payload: {
//         template_type: "button",
//         text: "Your intial code is ready! This is just an intial code to help. Do you want to see this intial code live, or send it to you?",
//         buttons: [
//           {
//             type: "postback",
//             payload: "VIEW",
//             title: "View Intial Code Live",
//           },
//           {
//             type: "postback",
//             payload: "EMAIL",
//             title: "Send it to me",
//           },
//         ],
//       },
//     },
//   };
//   callSendAPI(sender_psid, response);
// }





function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;
  if (payload === "START") {
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome to TLopia (AI Website Coder & Cloud Uploader ChatBot). Please choose how can we assist you today?",
          buttons: [
            {
              type: "postback",
              payload: "TRANSLATE",
              title: "Image to Code",
            },
            {
              type: "postback",
              payload: "UPLOAD",
              title: "Upload a WebSite",
            },
            {
              type: "postback",
              payload: "LINK",
              title: "View My Link",
            },
          ],
        },
      },
    };
  } else if (payload === "TRANSLATE") {
    response = {
      text: "We generate an intial code from wire-frames in images using AI. Please send a wire-frame image to try. (Please send a .jpg or .png image that is less than 4 mb and make the wire-frame as clear as possible.",
    };
  } else if (payload === "UPLOAD") {
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: 'This tools allows you to upload (ONE) HTML & CSS file and access it any where. Say "Start Over" or "Hi" to go back after you upload.',
          buttons: [
            {
              type: "web_url",
              url: `https://bytecanvas.onrender.com/uploader`,
              title: "Click here to upload",
            },
          ],
        },
      },
    };
  } else if (payload === "EMAIL") {
    response = { text: "Please Enter Your Email." };
  } else if (payload === "RUN") {
    myC(sender_psid);
    response = {
      text: "Please wait while we are building your intial code. This intial HTML & CSS code will make it easier to build your website. If nothing happened within 1 minute, this means the image is not compatible. If so, please send another Wire Frame Image, or say Start Over to go back.",
    };
  } else if (payload === "VIEW") {
    app.get(`/${sender_psid}/sample.html`, function (_req, res) {
      res.sendFile(join(resolve(), `./views/${sender_psid}/sample.html`));
    });
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Please click below to view the code live. After you finish, you can select email to send it to you, or ay Start Over for Main Menu.",
          buttons: [
            {
              type: "web_url",
              url: `https://bytecanvas.onrender.com/${sender_psid}/sample.html`,
              title: "Click Here to View",
            },
            {
              type: "postback",
              payload: "EMAIL",
              title: "Click Here to Email",
            },
          ],
        },
      },
    };
  } else if (payload === "YES_EMAIL") {
    sendEmail.sendConfirmation(em_send, sender_psid);
    console.log(em_send);
    response = {
      text: 'We sent the files to your Email. Please check your email and we are waiting for you to uplaod your website soon! You may say "Hi" or "Start Over" at any time to go back.',
    };
  } else if (payload === "LINK") {
    app.get(`/${sender_psid}`, function (_req, res) {
      res.sendFile(join(resolve(), `./views/${sender_psid}/index.html`));
    });
    if (!fs.existsSync(`./views/${sender_psid}`)) {
      fs.mkdirSync(`./views/${sender_psid}`);
      fs.writeFile(`./views/${sender_psid}/index.html`, ``, function (err) {
        if (err) {
          throw err;
        }
      });
    }
    response = {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Please click below to open your link. This link will point to any HTML file which you will upload using our tool. Just copy the link, share, and enjoy!",
          buttons: [
            {
              type: "web_url",
              url: `https://bytecanvas.onrender.com/${sender_psid}`,
              title: "Your Link is Here",
            },
          ],
        },
      },
    };
  } else {
    response = { text: "Something went Wrong!! Say Start Over for Main Menu." };
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}




function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid,
    },
    message: response,
  };
  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v16.0/me/messages",
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: "POST",
      json: request_body,
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is up and running at http://localhost:" + 8080);
});
