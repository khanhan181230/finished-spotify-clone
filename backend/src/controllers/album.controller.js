import { Album } from "../models/album.model.js";

export const getAllAlbums = async (req, res, next) => {
    try {
        const albums = await Album.find();
        res.status(200).json(albums);
    } catch (error) {
        next(error);
    }
};

export const getAlbumById = async (req, res, next) => {
    try {
        const {albumId} = req.params;

        //Find album by id and populate songs
        const album = await Album.findById(albumId).populate('songs');

        if (!album) {
            return res.status(404).json({message: "Album not found"});
        }

        // console.log("Album found:", album.title, "Songs count:", album.songs.length);
        res.status(200).json(album);

    } catch (error) {
        console.error("Error in getAlbumById:", error);
        next(error);
    }
}