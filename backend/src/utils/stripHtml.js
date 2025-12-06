// Very simple HTML tag cleaner for PoC
function stripHtml(html) {
    if (!html) return '';
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // remove scripts
      .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '') // remove CSS
      .replace(/<[^>]+>/g, '') // strip tags
      .replace(/\s+/g, ' ') // compress whitespace
      .trim();
  }
  
  module.exports = { stripHtml };
  