import express, { type Express, type Request, type Response } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import http from "http";

import { initDB } from "./app/common/services/database.service";
import { initPassport } from "./app/common/services/passport-jwt.service";
import { loadConfig } from "./app/common/helper/config.hepler";
import { type IUser } from "./app/user/user.dto";
import errorHandler from "./app/common/middleware/error-handler.middleware";
import routes from "./app/routes";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./app/swagger/swagger-output.json"
import rateLimit from "express-rate-limit";

loadConfig();


declare global {
  namespace Express {
    interface User extends Omit<IUser, "password"> {} 
    interface Request {
      user?: User;
    }
  }
}

const port = Number(process.env.PORT) ?? 5000;

const app: Express = express();
app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("dev"));

const initApp = async (): Promise<void> => {
  await initDB();

  initPassport();

  app.use("/api/v1", routes);

  app.get("/", (req: Request, res: Response) => {
    res.send({ status: "ok" });
  });

  app.use(errorHandler);

  http.createServer(app).listen(port, () => {
    console.log("Server is runnuing on port", port);
  });
};

void initApp();
