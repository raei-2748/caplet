/**
 * Replace image slide URLs in lessons (e.g. swap Reddit for Google Drive/Imgur).
 * Uses DATABASE_URL from backend/.env (PostgreSQL).
 *
 * Usage: node scripts/update-lesson-image-urls.js <mapping.json>
 *
 * Mapping format (course title → lesson title → array of image URLs in slide order):
 * {
 *   "Corporate Finance PART 1": {
 *     "Understanding Stakeholders": [
 *       "https://drive.google.com/uc?export=view&id=YOUR_FILE_ID",
 *       "https://i.imgur.com/xxxxx.jpg"
 *     ]
 *   }
 * }
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Course, Module, Lesson } = require('../models');

async function main() {
  const mappingPath = process.argv[2];
  if (!mappingPath) {
    console.error('Usage: node scripts/update-lesson-image-urls.js <mapping.json>');
    process.exit(1);
  }

  const absPath = path.isAbsolute(mappingPath) ? mappingPath : path.resolve(process.cwd(), mappingPath);
  if (!fs.existsSync(absPath)) {
    console.error('Mapping file not found:', absPath);
    process.exit(1);
  }

  const mapping = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  let updated = 0;

  for (const [courseTitle, lessonsMap] of Object.entries(mapping)) {
    const course = await Course.findOne({ where: { title: courseTitle } });
    if (!course) {
      console.warn('Course not found:', courseTitle);
      continue;
    }

    const modules = await Module.findAll({ where: { courseId: course.id } });
    const moduleIds = modules.map((m) => m.id);

    for (const [lessonTitle, imageUrls] of Object.entries(lessonsMap)) {
      if (!Array.isArray(imageUrls)) continue;

      const lesson = await Lesson.findOne({
        where: { moduleId: moduleIds, title: lessonTitle },
      });
      if (!lesson) {
        console.warn('Lesson not found:', courseTitle, '→', lessonTitle);
        continue;
      }

      let slides = lesson.slides;
      if (!Array.isArray(slides)) continue;

      let idx = 0;
      let changed = false;
      slides = slides.map((slide) => {
        if (slide.type !== 'image') return slide;
        const newUrl = imageUrls[idx];
        idx++;
        if (newUrl && slide.content !== newUrl) {
          changed = true;
          return { ...slide, content: newUrl };
        }
        return slide;
      });

      if (changed) {
        lesson.slides = slides;
        await lesson.save();
        console.log('Updated:', courseTitle, '→', lessonTitle);
        updated++;
      }
    }
  }

  console.log('\nDone. Updated', updated, 'lessons.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
