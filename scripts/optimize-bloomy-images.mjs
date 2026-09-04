import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const scriptDirectory = path.dirname(
  fileURLToPath(import.meta.url),
);

const projectDirectory = path.resolve(
  scriptDirectory,
  "..",
);

const bloomyDirectory = path.join(
  projectDirectory,
  "public",
  "bloomy",
);

const scenes = [
  "sunny",
  "cloudy",
  "rainy",
  "snowy",
  "sunrise",
  "sunset",
  "night",
  "aurora",
];

console.log("Optimizing Bloomy scenes...");

for (const scene of scenes) {
  const inputPath = path.join(
    bloomyDirectory,
    `${scene}.png`,
  );

  const outputPath = path.join(
    bloomyDirectory,
    `${scene}.webp`,
  );

  await sharp(inputPath)
    .webp({
      quality: 88,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(outputPath);

  console.log(`Created ${scene}.webp`);
}

console.log(
  "Bloomy scenes optimized successfully.",
);