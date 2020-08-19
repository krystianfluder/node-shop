const generateHr = (doc, y) => {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
};

exports.generateHr = generateHr;

exports.generateHeader = (doc) => {
  doc
    .image("public/img/node.png", 50, 45, { width: 70 })
    .fillColor("#444444")
    .fontSize(20)
    .text("node-shop", 140, 57)
    .fontSize(10)
    .text("123 Main Street", 200, 65, { align: "right" })
    .text("New York, NY, 10025", 200, 80, { align: "right" })
    .moveDown();
};
