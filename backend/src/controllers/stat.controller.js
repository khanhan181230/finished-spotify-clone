import { Song } from '../models/song.model.js';
import { User } from '../models/user.model.js';
import { Album } from '../models/album.model.js';

export const getStats = async (req, res, next) => {
  try {
  const [totalSongs, totalUsers, totalAlbums, uniqueArtists] = await Promise.all([
    Song.countDocuments(),
    User.countDocuments(),
    Album.countDocuments(),

    // Count unique artists across Songs and Albums
    Song.aggregate([
      // Combine artists from Songs and Albums
      { $unionWith: {
        coll: "albums",
        pipeline: []
      }},
      // Group by artist to get unique artists
      { $group: {
        _id: "$artist",
      }},
      // Count the unique artists
      {
        $count: "count",
      },
    ]),
  ]);

  res.status(200).json({
    totalAlbums,
    totalSongs,
    totalUsers,
    totalArtists: uniqueArtists[0]?.count || 0,
  });

  } catch (error) {
    next(error);
  }
}