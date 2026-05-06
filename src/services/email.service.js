import nodemailer from "nodemailer"; 
import config from "../config/config.js"

// Create transporter -> this is 1st Way
/*const transporter = nodemailer.createTransporter({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // agar SSL certificate apne apni website ke lekar rakha h to ise user karna
    // secure: STARTTLS, // agar SSL certificate apne apni website ke lekar rakha h to ise user karna
    auth: {
        user:"senderEmail@gmaial.com",
        pass:"senderPassword", // ye email login password nhi hoga iske liye ek alag se password gender karna padta h
    }
});*/


// this is 2nd way:->
const transporter = nodemailer.createTransporter({
    service: "gmail",
    auth: {
    	type:"OAuth2",
    	user: config.GOOGLE_USER,
    	clientId:GOOGLE_CLIENT_ID,
    	clientSecret:GOOGLE_CLIENT_SECRET,
    	refreshToken:GOOGLE_REFRESH_TOKEN
        // user:"senderEmail@gmaial.com",
        // pass:"senderPassword", // ye email login password nhi hoga iske liye ek alag se password gender karna padta h
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

	/*const mailOptions = {
		from: 'Your Name <your-email@gmail.com>',
		to:"reciever@gmail.com",
		subject: "Hello from nodemailer (Host Method)"
		text: "This email was send using the manual host configuration"
		html:"<b>This email was send using the manual host configuration</b>"
	}

	try{
		const info = await transporter.sendMail(mailOptions);
		console.log('email sent successfull');
		console.log('Message ID:', info.messageId)
	}catch(error){
		console.error("Error sending email:", error);
	}*/

}




// export default transporter;















// Raw / Raf Work:->


// 1st way:-> complete configration with host, port and secure
/*const transporter = nodemailer.createTransporter({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // agar SSL certificate apne apni website ke lekar rakha h to ise user karna
    // secure: STARTTLS, // agar SSL certificate apne apni website ke lekar rakha h to ise user karna
    auth: {
    	type:"OAuth2",
        user:"senderEmail@gmaial.com",
        clientId:GOOGLE_CLIENT_ID,
        clientSecret:GOOGLE_CLIENT_SECRET,
        refreshToken:GOOGLE_REFRESH_TOKEN
        // pass:"senderPassword", // ye email login password nhi hoga iske liye ek alag se password gender karna padta h
    }
});

const mailOptions = {
	from: 'Your Name <your-email@gmail.com>',
	to:"reciever@gmail.com",
	subject: "Hello from nodemailer (Host Method)"
	text: "This email was send using the manual host configuration"
	html:"<b>This email was send using the manual host configuration</b>"
}

try{
	const info = await transporter.sendMail(mailOptions);
	console.log('email sent successfull');
	console.log('Message ID:', info.messageId)
}catch(error){
	console.error("Error sending email:", error);
}*/