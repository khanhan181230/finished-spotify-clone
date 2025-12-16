import {Router} from 'express';
import { createSong, deleteSong, createAlbum, deleteAlbum, checkAdmin } from '../controllers/admin.controller.js';
import { protectRoute, requireAdmin } from '../middleware/auth.middleware.js';
const router = Router();

//Check if the user is admin or not (protected but not requiring admin)
router.get('/check', protectRoute, checkAdmin);

//All routes below require both authentication and admin privileges
router.use(protectRoute, requireAdmin);

//Create a new song
router.post("/songs", createSong);
//Delete a song by id
router.delete("/songs/:id", deleteSong);

//Create an album
router.post("/albums", createAlbum);
//Delete the album by id
router.delete("/albums/:id", deleteAlbum);

export default router;