import {Router} from 'express';
import { getAllAlbums, getAlbumById } from '../controllers/album.controller.js';

const router = Router();

// Fetch all albums
router.get("/", getAllAlbums);

// Fetch single album by id
router.get("/:albumId", getAlbumById);

export default router;