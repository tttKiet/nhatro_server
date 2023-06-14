import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();

async function main(email, code) {
  // Generate test SMTP service account from ethereal.email
  console.log("Generating test SMTP service account: email ", email);
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "gmail",
    // host: "smtp.gmail.com",
    host: "smtp.ethereal.email",
    pool: true,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.EMAIL_PASS, // generated ethereal password
    },
  });

  let htmlBody = `<h1 stype={{color: 'red'}}> Dear you</h1>
                  <p> Thank you for completing your registration with 'Future Motel'.</p>
                  <p>  This email serves as a confirmation that your account is activated and that you are officially a part of the [customer portal] family.
                  Enjoy!</p>

                  <p>Your code below</p>
                  <div stype={
                      {
                        display: 'flex',
                        justifyContent: center,
                        padding: 20px,
                        background: "linear-gradient(to right, rgba(255, 255, 255, 0.436), rgba(255, 255, 255, 0.736),
                        color: "#000"
                      }
                    }>
                  </div>
                  <strong>${code}</strong>
                  <p>
                    Thank you for completing your registration with BK.
                  </p>
                  <p>
                  Regards,
                  The Motel team
                  </p>
                  `;

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.EMAIL_USER, // sender address
    to: email, // list of receivers
    subject: "[Motel] Email Verification", // Subject line
    text: "[Motel] Email Verification", // plain text body
    html: htmlBody, // html body
  });

  // console.log("Message info: ", info);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

export default main;
