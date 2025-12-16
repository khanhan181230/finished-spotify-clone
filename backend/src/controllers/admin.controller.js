import {Song} from '../models/song.model.js';
import {Album} from '../models/album.model.js';
import cloudinary from '../lib/cloudinary.js';
import {clerkClient} from '@clerk/express';
const uploadToCloudinary = async (file) => {
  //Helper function to simulate file upload to Cloudinary
  //In real implementation, use Cloudinary SDK to upload file and get URL
  try {
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
    });
    // Return the secure URL of the uploaded file
    return result.secure_url;
  } catch (error) {
    console.error("Error in uploadToCloudinary:", error);
    //throw error to be handled by caller
    throw new Error("Error uploading file to Cloudinary");
  }
}
export const createSong = async (req, res, next) => {
  try {
    if(!req.files || !req.files.audioFile) {
      return res.status(400).json({message: "Audio file is required"});
    }
    //Extract song details and files from request
    const {title, artist, albumId, duration} = req.body;
    const audioFile = req.files.audioFile;
    const imageFile = req.files.imageFile;

    //Upload files to Cloudinary
    const audioUrl = await uploadToCloudinary(audioFile);
    const imageUrl = await uploadToCloudinary(imageFile);

    //Create new song
    const song = new Song({
      title,
      artist,
      albumId: albumId || null,
      duration,
      audioUrl,
      imageUrl,
    })

    //Save song to database
    await song.save();

    //If song belongs to an album, update the album's songs array
    if(albumId) {
      await Album.findByIdAndUpdate(albumId, {
        $push: { songs: song._id }
      });
    }
    res.status(201).json(song);
  
  } catch (error) {
    console.error("Error creating song:", error);
    next(error);
  }
}

export const deleteSong = async (req, res, next) => {
  try {
    //the id is based on the route params (admin.route.js)
    const { id }= req.params;

    //Find song by id 
    const song = await Song.findById(id);
    //If song belongs to an album, update the album's songs array to remove the song reference
    if(song.albumId){
      await Album.findByIdAndUpdate(song.albumId, {
        $pull: { songs: song._id }
      });
    }

    //Delete song from database
    await Song.findByIdAndDelete(id);

    res.status(200).json({message: "Song deleted successfully"});
  } catch (error) {
    console.error("Error in deleteSong", error);
    next(error);
  }
}

export const createAlbum = async (req, res, next) => {
  try{
    //Extract album details and image file from request
    const {title, artist, releaseYear} = req.body;
    const {imageFile} = req.files;
    //Upload album's cover to Cloudinary
    const imageUrl = await uploadToCloudinary(imageFile);
    //Create new album
    const album = new Album({
      title, 
      artist,
      imageUrl,
      releaseYear,
    });
    //Save album to database
    await album.save();
    res.status(201).json(album);
  } catch (error) {
    console.error("Error in createAlbum", error);
    next(error);
  }
}

export const deleteAlbum = async (req, res, next) => {
  try{
    // the id is based on the route params (admin.route.js)
    const {id} = req.params;
    //Find all the songs in the selected album and delete them
    await Song.deleteMany({albumId: id});
    await Album.findByIdAndDelete(id);
    res.status(200).json({message: "Album and its songs deleted successfully"});
  } catch (error) {
    console.error("Error in deleteAlbum", error);
    next(error);
  }
}

export const checkAdmin = async (req, res, next) => {
  try {
    console.log("checkAdmin endpoint called, userId:", req.auth?.userId);
    const currentUser = await clerkClient.users.getUser(req.auth.userId);
    console.log("Got currentUser:", currentUser.primaryEmailAddress?.emailAddress);
    const isAdmin = process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress.emailAddress;
    console.log("Checking admin:", {userEmail: currentUser.primaryEmailAddress.emailAddress, adminEmail: process.env.ADMIN_EMAIL, isAdmin});
    res.status(200).json({admin: isAdmin});
  } catch (error) {
    console.error("Error in checkAdmin", error);
    next(error);
  }
}
