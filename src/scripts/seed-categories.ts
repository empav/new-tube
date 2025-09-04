import db from "@/db";
import { categories } from "@/db/schema";

const categoryNames = [
  "Music",
  "Sports",
  "Gaming",
  "News",
  "Entertainment",
  "Education",
  "Science & Technology",
  "Travel & Events",
  "People & Blogs",
  "Comedy",
  "Howto & Style",
  "Film & Animation",
  "Pets & Animals",
  "Autos & Vehicles",
  "Nonprofits & Activism",
  "Shows",
  "Trailers",
  "Short Movies",
  "Documentary",
  "Action & Adventure",
  "Classics",
  "Cult Movies",
  "Horror",
  "Sci-Fi & Fantasy",
  "Thriller",
  "Anime/Animation",
  "Family",
  "Foreign Movies",
  "Music Videos",
];

async function main() {
  console.log("seeding categories...");
  try {
    const values = categoryNames.map((name) => ({
      name,
      description: `Videos related to category "${name}"`,
    }));
    await db.insert(categories).values(values);
    console.log("Categories seeded successfully...");
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
}

main();
