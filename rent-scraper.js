const { chromium } = require('playwright');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
  });
  const page = await context.newPage();

  const numPages = 88; // Total number of pages to scrape
  const baseUrl = 'https://kenyapropertycentre.com/for-rent?page=';

  const csvWriter = createCsvWriter({
    path: 'Rent-Data.csv',
    header: [
      { id: 'page', title: 'Page' },
      { id: 'bedroomRent', title: 'Bedroom Rent' },
      { id: 'price', title: 'Price' },
      { id: 'details', title: 'Details' },
      { id: 'address', title: 'Address' },
      { id: 'sellers', title: 'Sellers' },
      { id: 'sellersContact', title: 'Contact' },
      { id: 'link', title: 'Link' },
    ],
  });

  const records = [];

  for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
    const url = baseUrl + pageNumber;

    // Navigate to the current page
    await page.goto(url);

    const bedroomRent = await page.$$eval('.content-title', (els) =>
      els.map((el) => el.textContent)
    );
    const price = await page.$$eval('.pull-sm-left', (els) =>
      els.map((el) => el.textContent)
    );
    const details = await page.$$eval('.aux-info', (els) =>
      els.map((el) => el.textContent)
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

    const minLength = Math.min(
      bedroomRent.length,
      price.length,
      details.length,
      address.length,
      sellers.length,
      sellersContact.length,
      links.length
    );

    for (let i = 0; i < minLength; i++) {
      const numericPrice = price[i].replace(/[^0-9]/g, '');
      const numericCell = sellersContact[i].replace(/[^0-9]/g, '');
      const markets = sellers[i].replace(/\b[0-9]+\b/g, '');

      records.push({
        page: pageNumber,
        bedroomRent: bedroomRent[i],
        price: numericPrice,
        details: details[i],
        address: address[i],
        sellers: markets,
        Contact: numericCell,
        link: `https://kenyapropertycentre.com${links[i]}`,
      });
    }
  }

  // Write the records to the CSV file
  await csvWriter.writeRecords(records);

  await browser.close();
})();



// ********* Console.log Version for Testing ********************

// const { chromium } = require('playwright');

// (async () => {
//   const browser = await chromium.launch({ headless: true });
//   const context = await browser.newContext({
//     userAgent:
//       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
//   });
//   const page = await context.newPage();

//   const pageNumber = 1; // Page number to scrape
//   const baseUrl = 'https://kenyapropertycentre.com/for-rent?page=';

//   const url = baseUrl + pageNumber;

//   // Navigate to the page
//   await page.goto(url);

//   const bedroomRent = await page.$$eval('.content-title', (els) =>
//     els.map((el) => el.textContent)
//   );
//   const price = await page.$$eval('.pull-sm-left', (els) =>
//     els.map((el) => el.textContent)
//   );
//   const details = await page.$$eval('.aux-info', (els) =>
//     els.map((el) => el.textContent)
//   );
//   const address = await page.$$eval('address strong', (els) =>
//     els.map((el) => el.textContent.trim())
//   );
//   const sellers = await page.$$eval('.marketed-by', (els) =>
//     els.map((el) => el.textContent.trim().replace(/\s+/g, ' '))
//   );
//   const sellersContact = await page.$$eval('.marketed-by strong', (els) =>
//     els.map((el) => el.textContent)
//   );
//   const links = await page.$$eval('.wp-block-title.hidden-xs a', (els) =>
//     els.map((el) => el.getAttribute('href'))
//   );

//   const minLength = Math.min(
//     bedroomRent.length,
//     price.length,
//     details.length,
//     address.length,
//     sellers.length,
//     sellersContact.length,
//     links.length
//   );

//   for (let i = 0; i < minLength; i++) {
//     const numericPrice = price[i].replace(/[^0-9]/g, '');
//     const numericCell = sellersContact[i].replace(/[^0-9]/g, '');
//     const markets = sellers[i].replace(/\b[0-9]+\b/g, '');

//     console.log('Page:', pageNumber);
//     console.log('Bedroom Rent:', bedroomRent[i]);
//     console.log('Price:', numericPrice);
//     console.log('Details:', details[i]);
//     console.log('Address:', address[i]);
//     console.log('Sellers:', markets);
//     console.log('Contact:', numericCell);
//     console.log('Link:', `https://kenyapropertycentre.com${links[i]}`);
//     console.log('\n');
//   }

//   await browser.close();
// })();
