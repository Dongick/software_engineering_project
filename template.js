module.exports = {
    HTML:function(control){
      return `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        ${control}
      </body>
      </html>
      `;
    }
  }