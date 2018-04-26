const { Readable } = require('stream'); 
const inStream = new Readable({
  read(size) {
    this.push(String.fromCharCode(this.currentCharCode++));
    if (this.currentCharCode > 124) {
      this.push(null);
    }
  }
});
inStream.currentCharCode = 65;
inStream.on('data',data=>{console.log(1,data)})