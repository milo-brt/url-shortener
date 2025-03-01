import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import routes from "./routes/routes.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express();
router.use(cookieParser());
router.use(express.json());
router.set("view engine", "ejs");
router.set("views", path.join(__dirname, "/views"));

router.use(routes);

export default router;
