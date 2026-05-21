const { dedupe } = require('../src/utils/dedupe.js');

// Since the project uses ES modules, but node requires CJS for this quick test,
// we'll require the file via a small wrapper that imports the module dynamically.

(async () => {
  const { dedupe: dedupeMod } = await import('../src/utils/dedupe.js');

  const sample = [
    { name: 'Sotc Travel Ltd', phone: '9036695102', city: 'Rajkot', relevanceScore: 62 },
    { name: 'Sotc Travel Ltd', phone: '9036695102', city: 'Rajkot', relevanceScore: 62 },
    { name: 'Ramkrishna Tours Travels', phone: '7411807325', city: 'Rajkot', relevanceScore: 59 },
    { name: 'Ramkrishna Tours Travels', phone: '7411807325', city: 'Rajkot', relevanceScore: 59 },
    { name: 'Amazing Tours and Travels', phone: '7947253506', city: 'Rajkot', relevanceScore: 75 }
  ];

  const filtered = dedupeMod.filterDuplicates(sample);

  console.log('Original count:', sample.length);
  console.log('Deduped count:', filtered.length);
  console.log('Deduped items:', filtered);
})();
