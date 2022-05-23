import path from "path";
import express, { Request, Response } from "express";
import cors from "cors";
import logger from "morgan";
import axios, { AxiosResponse } from "axios";
import { createClient } from "redis";

(async () => {
  const app = express();
  const PORT = process.env.PORT || 8080;
  const redisClient = createClient();
  const DEFAULT_EXPIRATION = 3600;

  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(logger("dev"));
  app.use("/", express.static(path.join(__dirname, "public")));

  await redisClient.connect();

  const getORsetCache = (key: string, cb: () => Promise<AxiosResponse>) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await redisClient.get(key);
        if (data) return resolve(JSON.parse(data));
        const freshData = await cb();
        await redisClient.setEx(
          key,
          DEFAULT_EXPIRATION,
          JSON.stringify(freshData)
        );
        resolve(freshData);
      } catch (error) {
        reject(error);
      }
    });
  };

  //   app.get("/", (_, response: Response) => {
  //     response.json({ message: "Welcome To Redis Caching" });
  //   });

  app.get("/photos", async (request: Request, response: Response) => {
    try {
      const data = await getORsetCache(
        `photos?albumId=${request.query.albumId}`,
        async () => {
          const axiosResponse: AxiosResponse = await axios.get(
            "https://jsonplaceholder.typicode.com/photos",
            { params: { albumId: request.query.albumId } }
          );
          return axiosResponse.data;
        }
      );

      response.json(data);
    } catch (error: any) {
      response.json({ error: error.message });
    }
  });

  app.get("/photos/:id", async (request: Request, response: Response) => {
    try {
      const data = await getORsetCache(
        `photos:${request.params.id}`,
        async () => {
          const { data }: AxiosResponse = await axios.get(
            `https://jsonplaceholder.typicode.com/photos/${request.params.id}`
          );
          return data;
        }
      );
      response.json(data);
    } catch (error: any) {
      response.status(400).send(error.message);
    }
  });

  app.use("*", (_, response: Response) => {
    response.status(404).json({ message: "Invalid Route" });
  });

  app.listen(PORT, () => {
    console.log(`[server]: running on port ${PORT} 🚀`);
  });
})();
