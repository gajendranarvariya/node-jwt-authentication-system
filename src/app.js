
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import authRouter from "./routes/auth.routes.js";

const app = express();

 const limiter = rateLimit({
    windowMs : 15*60*1000 // 15 minute // time set in milisecond
    max: 100, // 
    message: "Too many rquests from this IP, please try again later" //
});


// use middleware body parser
app.use(express.json({limit:"20kb"}));
app.use(express.urlencoded({ limit: "20kb", extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(helmet());
app.use(limiter);
app.use("/api/auth", authRouter);


app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request body too large"
    });
  }
  return res.status(500).json({
      error: "Something went wrong"
    });
  next(err);
});


export default app;

