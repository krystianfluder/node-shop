const getParagraph = ({ text }) => {
  return `<p>${text}</p>\n`;
};

const getHeader = ({ text, level }) => {
  return `<h${level}>${text}</h${level}>\n`;
};

const getList = ({ style, items }) => {
  let type = "";
  if (style === "ordered") {
    type = "ol";
  } else if (style === "unordered") {
    type = "ul";
  }

  let tmp = `<${type}>\n`;
  items.forEach((item) => {
    tmp += `<li>${item}</li>\n`;
  });
  tmp += `</${type}>\n`;

  return tmp;
};

const getImage = ({
  url,
  caption,
  // stretched,
  // withBorder,
  // withBackground,
}) => {
  let tmp = `
    <figure class="figure">\n
      <img class="figure-img img-fluid" src="${url}"/>\n
      <figcaption class="figure-caption">${caption}</figcaption>\n
    </figure>\n
    `;
  return tmp;
};

const getEmbed = ({
  // service,
  // source,
  embed,
  // width,
  // height,
  // caption,
}) => {
  let tmp = `
    <div class="embed-responsive embed-responsive-16by9">\n
      <iframe class="embed-responsive-item" src="${embed}" allowfullscreen></iframe>\n
    </div>\n
  `;

  return tmp;
};

// table

const createTr = (tr) => {
  let tmp = `<tr>\n`;
  tr.forEach((th) => {
    tmp += `<th>${th}</th>\n`;
  });
  tmp += `</tr>\n`;
  return tmp;
};

const createTHead = (thead) => {
  let tmp = "<thead>\n<tr>\n";
  thead.forEach((th) => {
    tmp += `<th>${th}</th>\n`;
  });
  tmp += "</tr>\n</thead>\n";
  return tmp;
};

const createTBody = (tbody) => {
  let tmp = "<tbody>\n";
  tbody.forEach((tr) => {
    tmp += createTr(tr);
  });
  tmp += "</tbody>\n";
  return tmp;
};

const getTable = ({ content }) => {
  let thead = null;
  let tbody = [];

  content.forEach((tr) => {
    if (thead) {
      thead = tr;
    } else {
      tbody.push(tr);
    }
  });

  let tmp = `<table class="table table-striped">\n`;
  if (thead) {
    tmp += createTHead(thead);
  }
  if (tbody) {
    tmp += createTBody(tbody);
  }
  tmp += `</table>\n`;

  return tmp;
};

exports.getHtml = ({ blocks }) => {
  let html = "";
  blocks.forEach(({ type, data }) => {
    switch (type) {
      case "paragraph":
        return (html += getParagraph(data));
      case "header":
        return (html += getHeader(data));
      case "list":
        return (html += getList(data));
      case "image":
        return (html += getImage(data));
      case "table":
        return (html += getTable(data));
      case "embed":
        return (html += getEmbed(data));
      default:
        return (html += `unknow`);
    }
  });
  return html;
};
