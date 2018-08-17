let url = require('url');

let fetch = require('node-fetch');
// We lazy require jsdom because its so fat that it slows everything down.
// let jsdom = require('jsdom');
let pageMetadataParser = require('page-metadata-parser');

let time = require('./time');

/**
 * Gets all the info that we can gather about a given link, talking to remote services, doing analysis, etc.
 *
 * @param {string} link URL of the link
 *
 */
async function infoForLinkAsync(link) {
  let u = url.parse(link);
  let [metadata] = await Promise.all([metadataForLinkAsync(link)]);
  return {
    url: link,
    metadata,
  };
}

/**
 * Fetches the URL and then parses all the metadata from it and returns that
 *
 * @param {string} link URL of the link
 *
 */
async function metadataForLinkAsync(link) {
  let responseP = fetch(link);

  // We lazy require here for startup time performance reasons, even though
  // it means that the first time someone requests metadata about a link, it
  // will be a little slower
  // At least we can do this while we are waiting for the result of the fetch!

  time.start('metadata');
  time.start('require-jsdom');
  let jsdom = require('jsdom');
  time.end('require-jsdom');

  time.start('metadata-stalled');
  let response = await responseP;
  time.end('metadata-stalled');
  time.end('metadata');

  let contentType = response.headers.get('content-type');

  // TODO: What to do about things that aren't HTML pages?
  let html = await response.text();

  let dom = new jsdom.JSDOM(html);
  let doc = dom.window.document;
  let metadata = pageMetadataParser.getMetadata(doc, link);
  metadata.contentType = contentType;
  if (!metadata.type && contentType) {
    metadata.type = contentType.replace(/\/.*/, '');
  }
  return metadata;
}

module.exports = {
  infoForLinkAsync,
  metadataForLinkAsync,
};
