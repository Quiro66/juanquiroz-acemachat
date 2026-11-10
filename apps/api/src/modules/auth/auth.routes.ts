
import { Router } from "express";
import {
  getMe,
  login,
  register,
} from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Ruta protegida
router.get("/me", authenticate, getMe);

export default router;

