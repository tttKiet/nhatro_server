import homeRouter from "./homeRouter";
import apiRouter from "./apiRouter";

const route = (app) => {
  app.use("/api/v1", apiRouter);
  app.use("/", homeRouter);
};

export default route;
