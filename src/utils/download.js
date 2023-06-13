let fs = require('fs');
let path = require('path');

function downloadAsFile(res, fileContent, filename) {
  let relPath = path.join('./', filename); 
  fs.writeFile(relPath, fileContent, (err) => {
    if (err) {
      console.log("writeFile :");
      console.log(err);
    }
    res.download(relPath, (err) => {
      if (err) {
        console.log("download :");
        console.log(err);
      }
      fs.unlink(relPath, (err) => {
        if (err) {
          console.log("unlink :");
          console.log(err);
        }
        console.log('FILE [' + filename + '] REMOVED!');
      });
    });
  });
};
module.exports = {
    downloadAsFile
}