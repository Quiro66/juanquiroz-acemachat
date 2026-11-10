import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getConversations,
  postConversation,
} from "./conversations.controller";

const router = Router();

router.use(authenticate);

router.get("/", getConversations);
router.post("/", postConversation);

export default router;
