const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
  });

  const baseUrl = 'https://kenyapropertycentre.com/for-rent?page=';

  const htmlContent = [];

  // Iterate through all 88 pages
  for (let pageNumber = 1; pageNumber <= 92; pageNumber++) {
    const url = baseUrl + pageNumber;
    const page = await context.newPage();
    
    // Navigate to the current page
    await page.goto(url);

    // Rest of your scraping code...
    const bedroomRent = await page.$$eval('.content-title', (els) =>
      els.map((el) => el.textContent)
    );
    const price = await page.$$eval('.pull-sm-left', (els) =>
      els.map((el) => el.textContent)
    );
    const details = await page.$$eval('.aux-info', (els) =>
      els.map((el) => {
        // Get the text content of the element
        let text = el.textContent.trim();

        // Remove "Save" at the end of the text
        text = text.replace(/\s*Save$/, '');

        // Add spaces between numbers and keywords
        text = text.replace(/(\d+)\s*(Bathrooms|Bedrooms|Toilets|Parking Space)/g, '$1 $2');

        return text;
      })
    );
    const address = await page.$$eval('address strong', (els) =>
      els.map((el) => el.textContent.trim())
    );
    const sellers = await page.$$eval('.marketed-by', (els) =>
      els.map((el) => el.textContent.trim().replace(/\s+/g, ' '))
    );
    const sellersContact = await page.$$eval('.marketed-by strong', (els) =>
      els.map((el) => el.textContent)
    );
    const links = await page.$$eval('.wp-block-title.hidden-xs a', (els) =>
      els.map((el) => el.getAttribute('href'))
    );
    const images = await page.$$eval('div.wp-block-img-container img', (imgs) =>
      imgs.map((img) => img.getAttribute('src'))
    );

    const minLength = Math.min(
      bedroomRent.length,
      price.length,
      details.length,
      address.length,
      sellers.length,
      sellersContact.length,
      links.length,
      images.length
    );

    for (let i = 0; i < minLength; i++) {
      const numericPrice = parseInt(price[i].replace(/[^0-9]/g, ''));
      const formattedPrice = numericPrice.toLocaleString();
      const numericCell = sellersContact[i].replace(/[^0-9]/g, '');
      const markets = sellers[i].replace(/\b[0-9]+\b/g, '');

      // Generate HTML content for each record
      const recordHtml = `
        <div class="bg-white shadow-md p-4 my-4">
            <h2 class="text-xl font-semibold">${bedroomRent[i]}</h2>
            <p class="text-gray-700">${details[i]}</p>
            <p class="text-gray-600">Price: ${formattedPrice}</p>
            <p class="text-gray-600">Address: ${address[i]}</p>
            <p class="text-gray-600">Sellers: ${markets}</p>
            <p class="text-gray-600">Contact: ${numericCell}</p>
            <a href="${'https://kenyapropertycentre.com' + links[i]}" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Link</a>
            <img src="${images[i]}" alt="Property Image" class="mt-2">
        </div>
      `;
      htmlContent.push(recordHtml);
    }

    // Close the current page
    await page.close();
  }

  // Generate the final HTML content by joining individual record HTML
  const finalHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.16/dist/tailwind.min.css" rel="stylesheet">
        <title>Rent Data</title>
    </head>
    <body class="bg-gray-100 p-4">
        <div class="max-w-3xl mx-auto">
            <h1 class="text-3xl font-semibold mb-4">Rent Data</h1>
            ${htmlContent.join('')}
        </div>
    </body>
    </html>
  `;

  // Write the HTML content to an HTML file
  fs.writeFileSync('rent-data.html', finalHtml);

  // Close the browser context
  await context.close();
})();

// const { chromium } = require('playwright');
// const fs = require('fs');

// (async () => {
//   const browser = await chromium.launch({ headless: true });
//   const context = await browser.newContext({
//     userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
//   });

//   const baseUrl = 'https://kenyapropertycentre.com/for-rent?page=';

//   // Array to store HTML content for all pages
//   const allPagesContent = [];

//   // Iterate through all 92 pages
//   for (let pageNumber = 1; pageNumber <= 92; pageNumber++) {
//     const url = baseUrl + pageNumber;
//     const page = await context.newPage();
    
//     // Navigate to the current page
//     await page.goto(url);

//     // Rest of your scraping code...
//     const bedroomRent = await page.$$eval('.content-title', (els) =>
//       els.map((el) => el.textContent)
//     );
//     const price = await page.$$eval('.pull-sm-left', (els) =>
//       els.map((el) => el.textContent)
//     );
//     // ... (rest of your scraping logic)

//     // Close the current page
//     await page.close();

//     // Generate HTML content for the current page
//     const htmlContent = [];

//     for (let i = 0; i < bedroomRent.length; i++) {
//       const numericPrice = parseInt(price[i].replace(/[^0-9]/g, ''));
//       const formattedPrice = numericPrice.toLocaleString();
//       // ... (rest of your data processing logic)

//       // Generate HTML content for each record
//       const recordHtml = `
//         <div class="bg-white shadow-md p-4 my-4">
//             <h2 class="text-xl font-semibold">${bedroomRent[i]}</h2>
//             <!-- Insert other data fields here -->
//         </div>
//       `;

//       htmlContent.push(recordHtml);
//     }

//     allPagesContent.push(htmlContent.join(''));
//   }

//   // Generate the final HTML content with all pages
//   const finalHtml = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.16/dist/tailwind.min.css" rel="stylesheet">
//         <title>Rent Data</title>
//     </head>
//     <body class="bg-gray-100 p-4">
//         <div class="max-w-3xl mx-auto">
//             <h1 class="text-3xl font-semibold mb-4">Rent Data</h1>
//             ${allPagesContent.join('')}
//         </div>
//     </body>
//     </html>
//   `;

//   // Write the final HTML content to an HTML file
//   fs.writeFileSync('rent-data.html', finalHtml);

//   // Close the browser context
//   await context.close();
// })();

