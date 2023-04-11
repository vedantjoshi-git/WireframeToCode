"use strict";
const nodemailer = require("nodemailer");
require("dotenv").config();

function sendConfirmation(recipient_email, sender_psid)
{
    const eAddress = '';
    let transporter = nodemailer.createTransport({
        host : 'smtp.gmail.com',
        port : 465,
        auth: {
            user : eAddress,
            pass : 12345678,
        },

        debug : false,
        logger : true,

    })
} 

console.log(sender_psid);
let eConfirm = {
    from : eAddress,
    to : recipient_email,
    subject : 'Confirm your email',
    text : 'Please confirm your email by clicking on the link below',
    attachments : [
        {
            path: './views/{sender_psid}/sample.html',
        },
        {
            path: './views/{sender_psid}/autocodeai.css',
        },
    ],
}

transporter.sendMail(eConfirm, (err) => {
    if(err)
    {
        console.log(err);
        console.log('Email not sent');
        return;
    }
    else
    {
        console.log('Email sent');
    }
}) 

module.exports.sendConfirmation = sendConfirmation;