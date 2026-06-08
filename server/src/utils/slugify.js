const slugifyLib = require('slugify');

const generateSlug = (text) =>
  slugifyLib(text, { lower: true, strict: true }) + '-' + Date.now().toString(36);

module.exports = generateSlug;
