
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"; 

import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js"
import optModel from "../models/otp.model.js"

import config from "../config/config.js";
import { sendEmail } from "../services/email.service.js"
import {generateOtp, getOtpHtml} from "../utils/otpgenerate.utils.js";


export const register = async (req, res)=>{

	const { username, email, password } = req.body;

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

	const user = await userModel.create({
		username,
		email,
		password: hashedPassword
	});

	const otp = generateOtp(); // generate otp
	const html = getOtpHtml(otp);

	// save otp in database with hash formate, so create otp in hash formate
	const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
	await optModel.create({
		email,
		user:user._id,
		otpHash
	});


	await sendEmail(email, "OTP Verification",`Your OTP code is ${otp}`, html)

	return res.status(201).json({
		message: "User Create Successfully",
		user:{
			username:user.username,
			email:user.email,
			verified: user.verified
		}
	});
}


export const login = async (req, res)=>{
	
	const {email, password} = req.body;

	const user = await userModel.findOne({email});


	if (!user) {
		return res.status(401).json({message:"Invalid Email or Password"});
	}

	if (!user.verified) {
		return res.status(401).json({message:"Email not verified"});
	}

	const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

	const isPasswordValid = hashedPassword === user.password;

	if (!isPasswordValid) {
		return res.status(401).json({message:"Invalid Email or Password"});
	}


	// Generate Refresh Token
	const refreshToken = jwt.sign({id:user._id},config.JWT_SECRET_KEY,{expiresIn:"7d"});

	// Create session
	const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
	const session = await sessionModel.create({
		user: user._id,
		refreshTokenHash,
		ip:req.ip,
		userAgent:req.headers['user-agent']
	});


	// Generate Access Token
	const accessToken = await jwt.sign({id:user._id,sessionId:session._id},config.JWT_SECRET_KEY,{expiresIn:"15m"});


	res.cookie("refershToken", refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 7 * 24 * 60 * 60
	});

	return res.status(200).json({
		message: "User Logged In Successfully",
		user:{
			username:user.username,
			email:user.email
		},
		accessToken
	})


}



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


// Refresh and Access Token - kese use karte h 
export const refreshToken = async (req, res)=>{

	const refreshToken = req.cookies.refreshToken;

	console.log(refreshToken);

	if(!refreshToken){
		return res.status(401).json({
			message:"Refresh token not found"
		});
	}

	const decoded = jwt.verify(refreshToken,config.JWT_SECRET_KEY);

	const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");


	const session = await sessionModel.findOne({refreshTokenHash,revoked:false});

	if (!session) {
		return res.status(400).json({message:"Invalid refresh token"});
	}

	const accessToken = jwt.sign({id:decoded.id},config.JWT_SECRET_KEY,{expiresIn:"15m"});


	// ab hum newRefershToken bhi generate karge -> kyoki agar 7 dino ke bich me koi mera refreshToken ko copy kar le to bhi problem ho sakti hi to is problem se bach ne ke liye hum ise use karege
	const newRefreshToken = jwt.sign({id:decoded.id},config.JWT_SECRET_KEY,{expiresIn:"7d"});


	const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
	session.refreshTokenHash = newRefreshTokenHash;
	await session.save();

	res.cookie("refershToken", newRefreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 7 * 24 * 60 * 60
	});

	return res.status(200).json({
		message:"Access Token Refershed Successfully",
		accessToken
	});

}



export const logout = async (req, res)=>{
	
	const refreshToken = req.cookies.refershToken;

	if(!refreshToken){
		return res.status(400).json({message:"Refresh Token not Found"});
	}

	const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

	const session = await sessionModel.findOne({refreshTokenHash,revoked:false});

	if (!session) {
		return res.status(400).json({message:"Invalid Refresh Token"})
	}

	session.revoked = true;
	await session.save();

	res.clearCookie("refershToken");

	return res.status(200).json({message:"Logged Out Successfully"});


}


export const logoutAll = async (req, res)=>{

	const refreshToken = req.cookies.refreshToken;

	if (!refreshToken) {
		return res.status().json({
			message:"Refresh token not found"
		});
	}

	const decoded = jwt.verify(refreshToken,config.JWT_SECRET_KEY);

	await sessionModel.updateMany({
		user: decoded.id,
		revoked: false,
	},{
		revoked: true
	})

	res.clearCookie("refershToken");

	return res.status(200).json({message:"Logged out from all devices Successfully"}); 


}


// verify otp function

export const verifyEmail = async (req, res)=>{

	const {otp, email} = req.body;

	const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

	const optRecord = await optModel.findOne({email,otpHash});

	if (!optRecord) {
		return res.status(400).json({message:"Invalid OTP"});
	}

	const user = await userModel.findByIdAndUpdate(optRecord.user,{verified:true});

	await optModel.deleteMany({user:optRecord.user});

	return res.status(200).json({
		message:"Email verified Successfully",
		user:{
			username: user.username,
			email:user.email,
			verified: user.verified
		}
	});

}
