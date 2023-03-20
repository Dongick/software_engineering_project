module.exports = {
    HTML:function(control1, control){
      return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        ${control1}
        ${control}
      </body>
      </html>
      `;
    }
  }