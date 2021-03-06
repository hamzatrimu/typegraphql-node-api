import nodemailer from "nodemailer";

/**
 * Send email with the specified receiver's email, email subject and the email body
 *
 * @param email
 * @param subject
 * @param body
 */
export const sendEmail = async (
  email: string,
  subject: string,
  body: string
) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "njhflmellgsmeycw@ethereal.email", // generated ethereal user
      pass: "sc7mgDM1aEHx3SrBwX", // generated ethereal password
    },
  });

  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <hamza.ashraf@trimulabs.com>', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: body, // plain text body
  });
  if (!info) throw new Error("Email failed!");
};
