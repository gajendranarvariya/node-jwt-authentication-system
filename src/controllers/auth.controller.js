import crypto from "crypto";
import jwt from "jsonwebtoken";

import userModel from "../models/user.model.js";
import config from "../config/config.js";



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

export const login = async (req, res)=>{
	
	const {email, password} = req.body;

	const user = await userModel.findOne({email});


	if (!user) {
		return res.status(401).json({message:"Invalid Email or Password"});
	}

	const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

	const isPasswordValid = hashedPassword === user.password;

	if (!isPasswordValid) {
		return res.status(401).json({message:"Invalid Email or Password"});
	}


	const token = jwt.sign({id:user._id},config.JWT_SECRET_KEY,{expiresIn:"1d"});

	return res.status(200).json({
		message: "User Logged In Successfully",
		user:{
			username:user.username,
			email:user.email
		},
		token
	})

}



// Get me all user data
export const getMe = async (req, res)=>{

	const token = req.headers.authorization?.split(" ")[1];
	
	if(!token){
		return res.status(401).json({message:"Token not provided"});
	}

	try {

		const decoded = jwt.verify(token,config.JWT_SECRET_KEY);
		// console.log(decoded);

		const user = await userModel.findById(decoded.id);
		return res.status(200).json({
			message:"user fetched Successfully",
			user:{
				username:user.username,
				email:user.email
			},
			token
		});

	} catch(e) {
		if(e.name==="TokenExpiredError")
		{
			console.log("Token Expired");
			return res.status(401).json({
				error:"token_expired",
				message:"JWT Token has expired. Please refresh your token",
			});
		}
	}

}
