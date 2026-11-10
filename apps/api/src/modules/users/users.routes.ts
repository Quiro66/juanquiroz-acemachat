import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { getUsers } from "./users.controller";

const router = Router();

router.get("/", authenticate, getUsers);

export default router;
