import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import routes from "./routes/routes.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser());
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use("/urls", express.static(path.join(__dirname, "/public")));

app.use(routes);

export default app;
