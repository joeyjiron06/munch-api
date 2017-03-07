const parser = require('xml2json');

function getImageUrl(entry) {
  if (!entry.content) {
    return null;
  }
  return entry.content.$t.match(/src="[\w\W]+?"/)[0].replace('src="', '').replace('"', '');
}

class Feeds {

  /**
   * Convert an atom rss feed to the proper json structure for the REST API
   * @param {string} xml
   * @return {object} an JSON object containing the properties of the feed.
   */
  static atom(xml) {
    if (typeof xml !== 'string') {
      xml = '';
    }

    let feed = parser.toJson(xml, {
      object:true,
      sanitize: true,
      trim: true
    }).feed;

    if (!feed) {
      return null;
    }

    feed.link = feed.link || {};
    feed.entry = feed.entry || [];

    // when there is only one item the parse set entry to the entry json, not an array
    if (!Array.isArray(feed.entry)) {
      feed.entry = [feed.entry];
    }

    return {
      source: {
        title: feed.title,
        img_url: feed.icon,
        link: feed.link.href || null
      },

      items : feed.entry.map((entry) => {
        return {
          title: entry.title,
          link: entry.link ? entry.link.href : null,
          img_url: getImageUrl(entry)
        }
      })
    };
  }

}



module.exports = Feeds;