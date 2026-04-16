const puppeteer = require('puppeteer');
const csvWriter = require('csv-writer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://codeia.dev';
const PRICES_URL = `${BASE_URL}/precios`;
const LESSONS_URL = `${BASE_URL}/lecciones`;

const errors = {
  pricing: [],
  lessons: []
};

const scrapedData = {
  pricing: [],
  lessons: []
};

async function scrapeWithPuppeteer(url, timeout = 30000) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the page
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout
    });

    // Wait for content to load using a more compatible approach
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Try to wait for specific elements that might indicate content is loaded
    try {
      await page.waitForFunction(() => {
        return document.body && document.body.children.length > 5;
      }, { timeout: 10000 }).catch(() => {});
    } catch (e) {
      // Ignore timeout
    }

    const content = await page.content();
    return content;
  } finally {
    await browser.close();
  }
}

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 100);
}

async function downloadImage(url, filename, folder) {
  try {
    if (!url || url.startsWith('data:') || url === 'N/A') {
      return null;
    }

    // Handle relative URLs
    if (url.startsWith('/')) {
      url = BASE_URL + url;
    }

    const axios = require('axios');
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const filePath = path.join(folder, filename);
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.log(`Failed to download image: ${error.message}`);
    return null;
  }
}

async function scrapePricing() {
  try {
    console.log('Scraping pricing data...');
    const cheerio = require('cheerio');
    const html = await scrapeWithPuppeteer(PRICES_URL);

    // Debug: save HTML to file for inspection
    fs.writeFileSync('debug_pricing.html', html);
    console.log('Saved debug HTML to debug_pricing.html');

    const $ = cheerio.load(html);
    const pricingData = [];

    // Based on the HTML structure, find pricing cards using the outer div class
    // The Advanced plan has different border classes (border-purple-500 border-2)
    const pricingCards = $('div.rounded-lg').filter(function() {
      const $this = $(this);
      // Check if it has the main card classes
      const hasCardClasses = $this.hasClass('bg-card') && $this.hasClass('text-card-foreground') &&
                           ($this.hasClass('relative') && $this.hasClass('flex') && $this.hasClass('flex-col'));
      // Make sure it has an h3 with a plan name
      const $h3 = $this.find('h3.font-semibold.tracking-tight.text-2xl');
      return hasCardClasses && $h3.length > 0;
    });

    console.log(`Found ${pricingCards.length} pricing cards`);

    pricingCards.each((index, card) => {
      try {
        const $card = $(card);

        // Extract plan name from h3
        const planName = $card.find('h3.font-semibold.tracking-tight.text-2xl').text().trim();

        if (!planName || planName.length < 3) {
          return;
        }

        // Extract price from the div with class "text-4xl font-bold"
        let price = 'N/A';
        const $priceDiv = $card.find('.text-4xl.font-bold');
        if ($priceDiv.length > 0) {
          price = $priceDiv.text().trim();
        }

        // Extract period from the div with class "text-sm text-muted-foreground mt-1"
        let period = 'N/A';
        const $periodDiv = $card.find('.text-sm.text-muted-foreground.mt-1');
        if ($periodDiv.length > 0) {
          period = $periodDiv.text().trim();
        }

        // Extract features from li elements with SVG checkmarks
        const features = [];
        $card.find('li').each(function() {
          const $li = $(this);
          const text = $li.contents().not('svg').text().trim();
          // Only include features that have SVG checkmarks
          if ($li.find('svg.lucide-check').length > 0 && text.length > 3 && text.length < 200) {
            features.push(text);
          }
        });

        // Extract limitations (features without checkmarks)
        const limitations = [];
        $card.find('li.text-xs.text-muted-foreground').each(function() {
          const $li = $(this);
          const text = $li.text().trim();
          if (text.length > 3 && text.length < 200) {
            limitations.push(text);
          }
        });

        // Combine features and limitations
        if (limitations.length > 0) {
          features.push('Limitaciones: ' + limitations.join('; '));
        }

        pricingData.push({
          planName: planName,
          price: price,
          period: period,
          features: features.length > 0 ? features.join('; ') : 'N/A',
          featuresCount: features.length
        });
      } catch (error) {
        errors.pricing.push(`Pricing card ${index + 1}: ${error.message}`);
      }
    });

    scrapedData.pricing = pricingData;
    console.log(`Found ${pricingData.length} pricing plans`);
    return pricingData;
  } catch (error) {
    errors.pricing.push(`General error: ${error.message}`);
    return [];
  }
}

async function scrapeLessons() {
  try {
    console.log('Scraping lessons data...');
    const cheerio = require('cheerio');
    const html = await scrapeWithPuppeteer(LESSONS_URL, 40000);

    // Debug: save HTML to file for inspection
    fs.writeFileSync('debug_lessons.html', html);
    console.log('Saved debug HTML to debug_lessons.html');

    const $ = cheerio.load(html);
    const lessonsData = [];

    // Based on the HTML structure, lessons are in <article> elements with class="group flex flex-col"
    const articles = $('article.group').filter(function() {
      const $this = $(this);
      const $h2 = $this.find('h2');
      if ($h2.length === 0) return false;

      const title = $h2.text().trim();
      // Filter out non-lesson articles
      return title.length > 3 &&
             !title.includes('Legal') &&
             !title.includes('Sígueme') &&
             !title.includes('Configuración') &&
             !title.includes('Únete a') &&
             !title.includes('¿Qué encontrarás aquí?');
    });

    if (articles.length === 0) {
      errors.lessons.push('No lesson articles found on the page');
      return [];
    }

    console.log(`Found ${articles.length} lesson articles`);
    const lessonCards = articles;

    lessonCards.each((index, card) => {
      try {
        const $article = $(card); // This is now an <article> element

        // Extract title from the h2 element within the article
        const title = $article.find('h2').text().trim();

        if (!title || title.length < 3) {
          return;
        }

        // Get the link URL from the main <a> within the article
        const linkUrl = $article.find('a').first().attr('href');

        // Extract description from the <p> element
        const description = $article.find('p').text().trim();

        // Extract tags/badges from the span elements within the article
        const tags = [];
        $article.find('span[class*="font-medium"]').each((i, span) => {
          const tagText = $(span).text().trim();
          // Filter out tags that are too short or contain SVG icons
          if (tagText && tagText.length > 2 && tagText.length < 50 && !tagText.includes(title)) {
            tags.push(tagText);
          }
        });

        // Extract duration/time - look for clock icon sibling
        let duration = 'N/A';
        const clockSpan = $article.find('svg.lucide-clock').parent('span');
        if (clockSpan.length > 0) {
          duration = clockSpan.contents().not('svg').text().trim();
        }

        // Extract views - look for eye icon sibling
        let views = 'N/A';
        const eyeSpan = $article.find('svg.lucide-eye').parent('span');
        if (eyeSpan.length > 0) {
          views = eyeSpan.contents().not('svg').text().trim();
        }

        // Extract category from tags (level badges like "Principiante", "Avanzado", etc.)
        let category = 'N/A';
        for (const tag of tags) {
          if (['Principiante', 'Intermedio', 'Avanzado'].includes(tag)) {
            category = tag;
            break;
          }
        }

        // Extract cover image from the <img> element's srcset attribute
        let image = 'N/A';
        const $img = $article.find('img').first();
        if ($img.length > 0) {
          // Try srcset first, then fall back to src
          const srcset = $img.attr('srcset');
          const src = $img.attr('src');

          if (srcset) {
            // Extract the first URL from srcset
            const firstUrl = srcset.split(',')[0].trim().split(' ')[0];
            if (firstUrl) {
              image = firstUrl;
            }
          } else if (src) {
            image = src;
          }
        }

        // Handle relative URLs and Next.js image optimization
        if (image && image !== 'N/A') {
          if (image.startsWith('/')) {
            image = BASE_URL + image;
          }
          // Handle Next.js optimized images
          if (image.includes('/_next/image')) {
            const urlParams = new URL(image, BASE_URL).searchParams;
            const originalUrl = urlParams.get('url');
            if (originalUrl) {
              image = originalUrl.startsWith('/') ? BASE_URL + originalUrl : originalUrl;
            }
          }
        }

        // Extract video URL
        let videoUrl = 'N/A';
        if (linkUrl) {
          if (linkUrl.startsWith('/')) {
            videoUrl = BASE_URL + linkUrl;
          } else {
            videoUrl = linkUrl;
          }
        }

        lessonsData.push({
          title,
          description: description || 'N/A',
          tags: tags.join('; ') || 'N/A',
          tagsCount: tags.length,
          duration: duration || 'N/A',
          views: views || 'N/A',
          category: category || 'N/A',
          image: image || 'N/A',
          videoUrl: videoUrl || 'N/A'
        });
      } catch (error) {
        errors.lessons.push(`Lesson ${index + 1}: ${error.message}`);
      }
    });

    // Remove duplicates based on title
    const uniqueLessons = [];
    const seenTitles = new Set();
    for (const lesson of lessonsData) {
      if (!seenTitles.has(lesson.title)) {
        seenTitles.add(lesson.title);
        uniqueLessons.push(lesson);
      }
    }

    scrapedData.lessons = uniqueLessons;
    console.log(`Found ${uniqueLessons.length} unique lessons`);
    return uniqueLessons;
  } catch (error) {
    errors.lessons.push(`General error: ${error.message}`);
    return [];
  }
}

async function exportToCSV(data, filename, headers) {
  if (data.length === 0) {
    console.log(`No data to export for ${filename}`);
    return;
  }

  const writer = csvWriter.createObjectCsvWriter({
    path: filename,
    header: headers.map(h => ({id: h, title: h}))
  });

  await writer.writeRecords(data);
  console.log(`Exported ${filename}`);
}

async function exportToJSON(data, filename) {
  if (data.length === 0) {
    console.log(`No data to export for ${filename}`);
    return;
  }

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`Exported ${filename}`);
}

async function downloadImages(data, folderName, prefix) {
  if (data.length === 0) {
    console.log(`No images to download for ${folderName}`);
    return;
  }

  const imagesFolder = path.join(process.cwd(), folderName);

  if (!fs.existsSync(imagesFolder)) {
    fs.mkdirSync(imagesFolder, { recursive: true });
  }

  let downloadedCount = 0;
  const imagePromises = data.map(async (item, index) => {
    if (item.image && item.image !== 'N/A') {
      const ext = path.extname(item.image) || '.jpg';
      const filename = `${prefix}_${index + 1}_${sanitizeFilename(item.title || item.planName)}${ext}`;
      const result = await downloadImage(item.image, filename, imagesFolder);
      if (result) {
        downloadedCount++;
      }
    }
  });

  await Promise.all(imagePromises);
  console.log(`Downloaded ${downloadedCount} images to ${folderName}`);
}

function displayErrors() {
  console.log('\n=== ERRORES ENCONTRADOS ===');

  if (errors.pricing.length === 0 && errors.lessons.length === 0) {
    console.log('¡No se encontraron errores en los datos scrapeados!');
  } else {
    if (errors.pricing.length > 0) {
      console.log('\n--- Errores de Precios ---');
      errors.pricing.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }

    if (errors.lessons.length > 0) {
      console.log('\n--- Errores de Lecciones ---');
      errors.lessons.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }
  }
}

function displayDataQualityReport() {
  console.log('\n=== REPORTE DE CALIDAD DE DATOS ===');

  // Pricing data quality
  console.log('\nDatos de Precios:');
  if (scrapedData.pricing.length > 0) {
    const completePricing = scrapedData.pricing.filter(p => p.price !== 'N/A' && p.featuresCount > 0);
    const withNames = scrapedData.pricing.filter(p => p.planName && p.planName !== 'N/A').length;

    console.log(`- Total de planes de precios: ${scrapedData.pricing.length}`);
    console.log(`- Planes con nombres personalizados: ${withNames}`);
    console.log(`- Planes completos (con precio y características): ${completePricing.length}`);
    console.log(`- Planes incompletos: ${scrapedData.pricing.length - completePricing.length}`);

    if (scrapedData.pricing.length > 0) {
      console.log('\nDatos de ejemplo de precios:');
      console.log(JSON.stringify(scrapedData.pricing[0], null, 2));
    }
  } else {
    console.log('- No se encontraron datos de precios');
  }

  // Lessons data quality
  console.log('\nDatos de Lecciones:');
  if (scrapedData.lessons.length > 0) {
    const completeLessons = scrapedData.lessons.filter(l =>
      l.title !== 'N/A' &&
      l.description !== 'N/A' &&
      l.tagsCount > 0
    );
    const withImages = scrapedData.lessons.filter(l => l.image !== 'N/A').length;
    const withVideos = scrapedData.lessons.filter(l => l.videoUrl !== 'N/A').length;
    const withDurations = scrapedData.lessons.filter(l => l.duration !== 'N/A').length;
    const withViews = scrapedData.lessons.filter(l => l.views !== 'N/A').length;

    console.log(`- Total de lecciones: ${scrapedData.lessons.length}`);
    console.log(`- Lecciones completas (con título, descripción, etiquetas): ${completeLessons.length}`);
    console.log(`- Lecciones con imágenes: ${withImages}`);
    console.log(`- Lecciones con videos: ${withVideos}`);
    console.log(`- Lecciones con duración: ${withDurations}`);
    console.log(`- Lecciones con vistas: ${withViews}`);
    console.log(`- Lecciones incompletas: ${scrapedData.lessons.length - completeLessons.length}`);

    if (scrapedData.lessons.length > 0) {
      console.log('\nDatos de ejemplo de lecciones:');
      console.log(JSON.stringify(scrapedData.lessons[0], null, 2));
    }
  } else {
    console.log('- No se encontraron datos de lecciones');
  }
}

async function main() {
  try {
    console.log('Iniciando scraper para Codeia.dev...');
    console.log('Esto puede tomar un momento ya que necesitamos renderizar JavaScript...\n');

    // Scrape pricing data
    const pricingData = await scrapePricing();

    // Scrape lessons data
    const lessonsData = await scrapeLessons();

    // Export to CSV
    if (pricingData.length > 0) {
      await exportToCSV(pricingData, 'precios.csv', [
        'planName', 'price', 'period', 'features', 'featuresCount'
      ]);
    }

    if (lessonsData.length > 0) {
      await exportToCSV(lessonsData, 'lecciones.csv', [
        'title', 'description', 'tags', 'tagsCount', 'duration', 'views',
        'category', 'image', 'videoUrl'
      ]);
    }

    // Export to JSON
    if (pricingData.length > 0) {
      await exportToJSON(pricingData, 'precios.json');
    }

    if (lessonsData.length > 0) {
      await exportToJSON(lessonsData, 'lecciones.json');
    }

    // Download images
    if (pricingData.length > 0) {
      await downloadImages(pricingData, 'precios_images', 'precio');
    }

    if (lessonsData.length > 0) {
      await downloadImages(lessonsData, 'lecciones_images', 'leccion');
    }

    // Display results and errors
    displayDataQualityReport();
    displayErrors();

    console.log('\n=== RESUMEN ===');
    console.log(`Planes de precios scrapeados: ${pricingData.length}`);
    console.log(`Lecciones scrapeadas: ${lessonsData.length}`);
    console.log('¡Scraping completado!');

  } catch (error) {
    console.error('Error fatal en el proceso principal:', error.message);
    console.error(error.stack);
  }
}

main();