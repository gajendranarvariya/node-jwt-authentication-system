import nodemailer from "nodemailer"; 
import config from "../config/config.js"


// this is 2nd way:->
const transporter = nodemailer.createTransporter({
    service: "gmail",
    auth: {
    	type:"OAuth2",
    	user: config.GOOGLE_USER,
    	clientId:GOOGLE_CLIENT_ID,
    	clientSecret:GOOGLE_CLIENT_SECRET,
    	refreshToken:GOOGLE_REFRESH_TOKEN
    }
});

transporter.verify((error,success)=>{
	if(error){
		console.log("error connecting to email server:", error);
	} else {
		console.log('Email server is ready to send messages')
	}
});


export const sendEmail = async (to, subject, text, html) => {

	try {
		const info = await transporter.sendMail({
			from: `"Your Name" <${config.GOOGLE_USER}>`,
			to,
			subject,
			text,
			html
		});

		console.log('email sent successfull');
		console.log('Message ID:', info.messageId)

	} catch(error) {
		console.error("Error sending email:", error);
	}
}
