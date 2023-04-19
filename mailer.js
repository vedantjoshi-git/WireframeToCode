"use strict";
import nodemailer from "nodemailer";
import * as dotenv from 'dotenv';
dotenv.config();

function sendConfirmation(recipient_email,sender_psid) 
{
  const eAddress = "vedantjoshi122002@gmail.com";
   let transporter = nodemailer.createTransport({
       host: "smtp.gmail.com",
       port: 587,
       auth: {
         user:"vedantjoshi122002@gmail.com",
         pass:"12345678"
       },
   debug: false,
   logger: true
});

console.log(sender_psid);
   let eConfirm= {
       from: eAddress, 
       to: recipient_email,
       subject: "Your Files are here",
       text: "Good news, your files are here. These files are a good start and may help you build you webpage. Once your page is ready, come back and upload it on the cloud for FREE!!",
       attachments: [
           {
               path: `./views/${sender_psid}/sample.html`,
           },
           {
               path: `./views/${sender_psid}/autocodeai-form.css`,
           }
       ]
   }

   transporter.sendMail(eConfirm, function(err){
       if(err){
           console.log(err);
           console.log("Failed to send email.\n");
           return;
       }
       else{
           console.log("Confirmation sent successfully!");
       }
   });
}

export default sendConfirmation;
