import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import {
  getMessages,
  postMessage,
} from "./messages.controller";

const router = Router();

router.use(authenticate);

router.get("/:conversationId/messages", getMessages);
router.post("/:conversationId/messages", postMessage);

export default router;
