import "dotenv/config";
import connectdb from "./src/config/mongodb.js";
import songModel from "./src/models/songModel.js";

const seedSongs = [
  {
    name: "Midnight Drive",
    desc: "Synthwave cruise for late nights.",
    album: "Night Rides",
    image: "https://placehold.co/600x600/0f172a/ffffff.png?text=Midnight+Drive",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "5:32",
  },
  {
    name: "Neon Skies",
    desc: "Bright hooks over a steady beat.",
    album: "Night Rides",
    image: "https://placehold.co/600x600/111827/ffffff.png?text=Neon+Skies",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "6:12",
  },
  {
    name: "Sunrise Coast",
    desc: "Warm guitar with ocean air.",
    album: "Coastal Lines",
    image: "https://placehold.co/600x600/1f2937/ffffff.png?text=Sunrise+Coast",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "5:08",
  },
  {
    name: "Golden Hour",
    desc: "Chill acoustic groove.",
    album: "Coastal Lines",
    image: "https://placehold.co/600x600/334155/ffffff.png?text=Golden+Hour",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: "5:45",
  },
  {
    name: "Loft Study",
    desc: "Lo-fi beats for focus.",
    album: "Loft Sessions",
    image: "https://placehold.co/600x600/0b1320/ffffff.png?text=Loft+Study",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: "6:01",
  },
  {
    name: "Rainy Window",
    desc: "Soft piano and rain textures.",
    album: "Loft Sessions",
    image: "https://placehold.co/600x600/0a0f1a/ffffff.png?text=Rainy+Window",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    duration: "5:21",
  },
  {
    name: "Desert Bloom",
    desc: "Ambient chords and slow drums.",
    album: "Mirage",
    image: "https://placehold.co/600x600/1b1f2a/ffffff.png?text=Desert+Bloom",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    duration: "6:04",
  },
  {
    name: "Skyline Run",
    desc: "Fast-paced cardio mix.",
    album: "Momentum",
    image: "https://placehold.co/600x600/111111/ffffff.png?text=Skyline+Run",
    file: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: "5:50",
  },
];

const run = async () => {
  try {
    await connectdb();

    const shouldClear = process.argv.includes("--clear");
    if (shouldClear) {
      const result = await songModel.deleteMany({});
      console.log(`Cleared ${result.deletedCount} existing songs.`);
    }

    const inserted = await songModel.insertMany(seedSongs);
    console.log(`Seeded ${inserted.length} songs.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

run();
