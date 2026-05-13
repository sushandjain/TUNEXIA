import "dotenv/config";
import connectdb from "./src/config/mongodb.js";
import albumModel from "./src/models/albumModel.js";
import songModel from "./src/models/songModel.js";

const audioUrls = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
];

const durations = ["3:40", "4:05", "4:22", "5:01", "3:55", "4:48", "5:12", "4:30", "3:58", "4:15"];

const categories = [
  {
    album: {
      name: "Hindi Hits",
      desc: "Top 10 Hindi-inspired pop and dance grooves.",
      bgColor: "#7c2d12",
      image: "https://picsum.photos/seed/hindi-hits/600/600",
    },
    songTitles: [
      "Monsoon Rhythm",
      "City Lanterns",
      "Desert Bloom",
      "Festival Glow",
      "Sunset Bazaar",
      "Skyline Sitar",
      "Golden Courtyard",
      "Rainy Streets",
      "Evening Raga",
      "Midnight Pulse",
    ],
    songDesc: "Hindi pop groove with warm melodies.",
  },
  {
    album: {
      name: "English Hits",
      desc: "Top 10 English pop and rock staples.",
      bgColor: "#1f2937",
      image: "https://picsum.photos/seed/english-hits/600/600",
    },
    songTitles: [
      "City Lights",
      "Midnight Radio",
      "Runaway Heart",
      "Neon Avenue",
      "Silver Lining",
      "High Tide",
      "Golden Echo",
      "Wild Horizon",
      "Blue Skyline",
      "Firefly Drive",
    ],
    songDesc: "Bright hooks over a steady beat.",
  },
  {
    album: {
      name: "Kannada Vibes",
      desc: "Top 10 Kannada-inspired melodies and modern beats.",
      bgColor: "#0f172a",
      image: "https://picsum.photos/seed/kannada-vibes/600/600",
    },
    songTitles: [
      "Bengaluru Breeze",
      "Cauvery Flow",
      "Mysore Nights",
      "Temple Street",
      "Coffee Estate",
      "Sunrise Ghats",
      "Silk City",
      "Monsoon Valley",
      "Lake View",
      "Festival Rain",
    ],
    songDesc: "Modern beats with regional flavor.",
  },
  {
    album: {
      name: "Devotional Calm",
      desc: "Top 10 calm devotional and spiritual pieces.",
      bgColor: "#334155",
      image: "https://picsum.photos/seed/devotional-calm/600/600",
    },
    songTitles: [
      "Morning Aarti",
      "Temple Bells",
      "Sacred River",
      "Quiet Prayer",
      "Lotus Path",
      "Divine Light",
      "Peace Chant",
      "Candle Glow",
      "Evening Bhajan",
      "Blessed Dawn",
    ],
    songDesc: "Soft ambient textures and soothing chants.",
  },
  {
    album: {
      name: "Lo-Fi Focus",
      desc: "Top 10 chill beats for study and focus.",
      bgColor: "#111827",
      image: "https://picsum.photos/seed/lofi-focus/600/600",
    },
    songTitles: [
      "Window Rain",
      "Late Night Notes",
      "Paper Planes",
      "Silent Library",
      "Desk Lamp",
      "Soft Haze",
      "Quiet Hall",
      "Grey Skies",
      "Warm Mug",
      "Slow Drift",
    ],
    songDesc: "Lo-fi beats for deep focus.",
  },
];

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const buildSongs = () => {
  const songs = [];
  let audioIndex = 0;

  categories.forEach((category) => {
    const albumName = category.album.name;
    const albumSlug = slugify(albumName);

    category.songTitles.forEach((title, index) => {
      const image = `https://picsum.photos/seed/${albumSlug}-${index + 1}/600/600`;
      const audio = audioUrls[audioIndex % audioUrls.length];
      const duration = durations[index % durations.length];

      songs.push({
        name: title,
        desc: category.songDesc,
        album: albumName,
        image,
        file: audio,
        duration,
      });

      audioIndex += 1;
    });
  });

  return songs;
};

const run = async () => {
  try {
    await connectdb();

    const shouldClear = process.argv.includes("--clear");
    if (shouldClear) {
      const songResult = await songModel.deleteMany({});
      const albumResult = await albumModel.deleteMany({});
      console.log(`Cleared ${songResult.deletedCount} songs and ${albumResult.deletedCount} albums.`);
    }

    const albums = await albumModel.insertMany(categories.map((c) => c.album));
    const songs = await songModel.insertMany(buildSongs());

    console.log(`Seeded ${albums.length} albums.`);
    console.log(`Seeded ${songs.length} songs.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

run();
