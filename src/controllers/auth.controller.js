import crypto from "crypto";
import userModel from "../models/user.model.js";


export const register = async (req, res)=>{

	const { username, email, password } = req.body;

	// Check user already exist or not
	const isAlreadyRegistered = await userModel.findOne({
		$or:[
			{username},
			{email}
		]
	});

	if(isAlreadyRegistered){
		return res.status(409).json({message:"Username or Email already exists!!"})
	}

	const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
	// console.log(hashedPassword);

	const user = await userModel.create({
		username,
		email,
		password: hashedPassword
	});

	return res.status(201).json({
		message: "User Create Successfully",
		user:{
			username:user.username,
			email:user.email,
		}
	});


}
