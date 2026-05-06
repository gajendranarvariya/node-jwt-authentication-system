import mongoose from "mongoose";

const mongooseSchema = new mongoose.Schema({
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref: "users",
		required: [true,"User is required"]
	},
	refreshTokenHash:{
		type: String,
		required: [true, "Refresh token hash is required"]
	},
	ip:{
		type: String,
		required: [true, "IP Address is required"]
	},
	userAgent:{
		type: String,
		required: [true, "User Agent is required"]
	},
	revoked:{
		type: Boolean,
		default: false
	}
},{
	timestamps: true
});

const sessionModel = mongoose.model("session",mongooseSchema);

export default sessionModel;
