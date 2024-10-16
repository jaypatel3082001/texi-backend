const fs = require("fs").promises; // Use the promise version of fs
const filePath = "./userCount.json";
const nodemailer = require("nodemailer");
const { kv } = require("@vercel/kv");
// Import Vercel KV SDK

const userCountKey = "userCount"; 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
const sendEmail = async (to, subject, data) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: to,
    subject: subject,
    html: `
<h1 style="text-align: center; color: #333; font-family: Arial, sans-serif;">Booked Ride Person Details</h1>

<div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9; font-family: Arial, sans-serif;">
    <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; color: #555;">Name:</div>
        <div style="font-size: 16px; color: #333;">${data.name}</div>
    </div>

    <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; color: #555;">Phone Number:</div>
        <div style="font-size: 16px; color: #333;">${data.contactNum}</div>
    </div>

    <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; color: #555;">Pick Up Details:</div>
        <div style="font-size: 16px; color: #333;">${data.source}</div>
    </div>

    <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; color: #555;">Drop Off Details:</div>
        <div style="font-size: 16px; color: #333;">${data.destination}</div>
    </div>
    <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; color: #555;">total distance</div>
        <div style="font-size: 16px; color: #333;">${data.totalDistance}km</div>
    </div>

    <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; color: #555;">Person is Disabled:</div>
        <div style="font-size: 16px; color: #333;">${
          data.disabledAccess ? "Yes" : "No"
        }</div>
    </div>

    <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; color: #555;">Is a Child Available:</div>
        <div style="font-size: 16px; color: #333;">${
          data.childAvailability ? "Yes" : "No"
        }</div>
    </div>
     <div style="margin-bottom: 15px;">
        <div style="font-weight: bold; color: #555;">Payment Details:</div>
        <div style="font-size: 16px; color: #333;">${data.paymentMode}</div>
    </div>
</div>

<div style="text-align: center; margin-top: 20px; font-family: Arial, sans-serif;">
    <p style="font-size: 14px; color: #777;">Thank you for booking with us!</p>
</div>

  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};
async function emailSender(req, res) {
  try {
    // Increment user count before reading it
    const data = req.body;
    const to = process.env.OWNER_EMAIL;
    const sub = process.env.EMAIL_SUBJECT;

    console.log("sub", sub);
    console.log("paa", to);

    await sendEmail(to, sub, data);

    res.status(201).json("email sent successfully");
  } catch (error) {
    res.status(500).json(`Internal server error: ${error}`);
  }
}
async function userCount(req, res) {
  try {
    const { revisedIp } = req.query;
    let userIp = req.ip;

    if (revisedIp) {
      return res.status(401).json(`You have already visited the page`);
    }

    // Increment user count using Vercel KV
    await incrementUserCount();

    // Retrieve the updated user count from KV
    let userCount = await kv.get(userCountKey);
    if (!userCount) {
      userCount = 0; // Initialize user count if it's not in KV
    }

    // Send response with updated user count and user IP
    res.status(201).json({ data: { userCount, userIp } });
  } catch (error) {
    console.error(`Internal server error: ${error.message}`);
    res.status(500).json(`Internal server error: ${error.message}`);
  }
}


const incrementUserCount = async () => {
  try {
    // Get the current user count from Vercel KV
    let countData = await kv.get(userCountKey);
    
    // If the key doesn't exist, initialize the user count
    if (!countData) {
      countData = 0;
    }

    // Increment the user count
    countData++;

    // Set the updated user count in Vercel KV
    await kv.set(userCountKey, countData);

    console.log(`User count updated: ${countData}`);
  } catch (error) {
    console.error(`Failed to update user count: ${error.message}`);
    throw error;
  }
};

module.exports = {
  userCount,
  incrementUserCount,
  emailSender,
};
