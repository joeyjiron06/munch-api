const parser = require('xml2json');

class Feeds {

  /**
   * Convert an atom rss feed to the proper json structure for the REST API
   * @param {string} xml
   * @return {object||null} an JSON object containing the properties of the feed.
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

  /**
   * Convert an atom rss feed to the proper json structure for the REST API
   * @param {string} xml
   * @return {object||null} an JSON object containing the properties of the feed.
   */
  static rss(xml) {
    let channel;

    try {
      channel = parser.toJson(xml, {
        object:true,
        sanitize: true,
        trim: true
      }).rss.channel;
    } catch (e) {}

    // bad data - return null
    if (!channel) {
      return null;
    }


    let source = {
      title : channel.title || null,
      link : channel.link || null,
      img_url : (channel.image || {}).url || null
    };

    let items = channel.item || [];

    if (!Array.isArray(items)) {
      items = [items];
    }

    items = items.map((item) => {
      // TODO refector to separate function
      let img_url = null;
      let imgMatch = (item.description || '').match(/src="[\w\W]+?"/) || '';
      if (imgMatch[0]) {
        img_url = imgMatch[0].replace('src="', '').replace('"', '');
      }

      return {
        title : item.title || null,
        link: item.link || null,
        img_url
      }
    });

    return {
      source,
      items
    };
  }


}



module.exports = Feeds;