exports.getBreadcrumbs = (url) => {
  if (url === "/") {
    return [
      {
        name: "home",
        slug: "/",
      },
    ];
  }

  const breadcrumbs = [];
  let first = true;
  let tmpUrl = "";
  url.split("/").forEach((breadcrumb) => {
    if (first) {
      breadcrumbs.push({
        name: "home",
        slug: "/",
      });
      first = false;
    } else {
      tmpUrl += `/${breadcrumb}`;
      if (breadcrumb !== "") {
        breadcrumbs.push({
          name: breadcrumb,
          slug: tmpUrl,
        });
      }
    }
  });
  return breadcrumbs;
};
