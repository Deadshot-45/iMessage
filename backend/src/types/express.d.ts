import User from "../models/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>;
    }
  }
}
