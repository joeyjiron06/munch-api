const parser = require('xml2json');

class Feeds {

  /**
   * Convert an atom rss feed to the proper json structure for the REST API
   * @param {string} xml
   * @return {object} an JSON object containing the properties of the feed.
   */
  static atom(xml) {
    let feed;

    try {
      feed = parser.toJson(xml, {
        object:true,
        sanitize: true,
        trim: true
      }).feed;
    } catch (e) {}

    // bad data - return null
    if (!feed) {
      return null;
    }

    let source = {
      title : feed.title || null,
      img_url : feed.icon || null,
      link: (feed.link || {}).href || null
    };

    let entries = feed.entry || [];

    // when there is only one item the parse set entry to the entry json, not an array
    if (!Array.isArray(entries)) {
      entries  = [entries];
    }

    // map the entries
    entries = entries.map((entry) => {
      entry.link = entry.link || {};

      // try to extract image url
      let img_url = null;
      let content =  (entry.content || {}).$t || '';
      let imgMatch = content.match(/src="[\w\W]+?"/) || '';
      if (imgMatch[0]) {
        img_url = imgMatch[0].replace('src="', '').replace('"', '');
      }

      return {
        title: entry.title || null,
        link: entry.link.href || null,
        img_url,
      }
    });


    return {
      source: source,
      items : entries
    };
  }

}



module.exports = Feeds;