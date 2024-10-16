const fs = require("fs").promises; // Use the promise version of fs
const filePath = "./userCount.json";
const nodemailer = require("nodemailer");

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

async function userCount(req, res) {
  try {
    // Increment user count before reading it
    const { revisedIp } = req.query;
    // console.log(req.ip)
    let userIp = req.ip;
    if (revisedIp) {
      res.status(401).json(`you have already visited page`);
    }
    await incrementUserCount();

    // Read the updated user count
    const data = await fs.readFile(filePath, "utf8");

    // Safely parse JSON
    let userCount;
    if (data) {
      try {
        userCount = JSON.parse(data);
      } catch (error) {
        // If JSON parsing fails, initialize with 0
        userCount = { userCount: 0 };
      }
    } else {
      // Handle empty file case
      userCount = { userCount: 0 };
    }
    userCount = userCount.userCount;
    // Send response with updated user count
    res.status(201).json({ data: { userCount, userIp } });
  } catch (error) {
    if (error.code === "ENOENT") {
      // Handle file not found case
      res.status(400).json(`user file not found: ${error.message}`);
    } else {
      res.status(500).json(`Internal server error: ${error.message}`);
    }
  }
}
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

const incrementUserCount = async () => {
  try {
    let countData;
    try {
      // Try reading the file
      const data = await fs.readFile(filePath, "utf8");
      if (data) {
        try {
          countData = JSON.parse(data);
        } catch (error) {
          // Handle corrupted JSON
          countData = { userCount: 0 };
        }
      } else {
        // If the file is empty, start with userCount = 0
        countData = { userCount: 0 };
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        // If the file doesn't exist, start with userCount = 0
        countData = { userCount: 0 };
      } else {
        throw error;
      }
    }

    // Increment the user count
    countData.userCount++;

    // Write the updated count back to the file
    await fs.writeFile(filePath, JSON.stringify(countData));
    console.log(`User count updated: ${countData.userCount}`);
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
