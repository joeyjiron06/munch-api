const parser = require('xml2json');

function getImageUrl(entry) {
  return entry.content.$t.match(/src="[\w\W]+?"/)[0].replace('src="', '').replace('"', '');
}

class Feeds {

  /**
   * Convert an atom rss feed to the proper json structure for the REST API
   * @param {string} rawXML
   * @return {object} an JSON object containing the properties of the feed.
   */
  static atom(rawXML) {
    let data = parser.toJson(rawXML, {
      object:true,
      sanitize: true,
      trim: true
    });

    let feed = data.feed;

    return {
      source: {
        title: feed.title,
        img_url: feed.icon,
        link: feed.link.href
      },

      items : feed.entry.map((entry) => {
        return {
          title: entry.title,
          link: entry.link.href,
          img_url: getImageUrl(entry)
        }
      })
    };
  }

}



module.exports = Feeds;