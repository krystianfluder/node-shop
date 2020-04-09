exports.get404 = (req, res, next) => {
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
  });
};

exports.getError = (error, req, res, next) => {
  res.status(error.status).render("error", {
    pageTitle: "Error",
    path: "/error",
    // message: error.message,
    status: error.status,
  });
};
