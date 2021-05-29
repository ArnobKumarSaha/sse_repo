const crypto =  require("crypto")
const fs = require('fs');

// Including generateKeyPair from crypto module
const { generateKeyPair } = require('crypto');

// first we need two keys here - index key and private key. Private key will
// be generated only once and then somehow store it

let indexKey = "9uZlGXa0o64kdbQ6Gb96qw=="

let publicKeyPath = './keys/publicKey.key'
let privateKeyPath = './keys/privateKey.key'


// Calling generateKeyPair() method
// with its parameters
exports.generateKeys = () => {

  return new Promise( (resolve, reject) => {

    generateKeyPair('rsa', {
      modulusLength: 2048, // options
      publicExponent: 0x10101,
      publicKeyEncoding: {
         type: 'pkcs1',
         format: 'pem'
      },
      privateKeyEncoding: {
         type: 'pkcs8', 
         format: 'pem',
         cipher: 'aes-192-cbc',
         passphrase: 'sse'
      }
   }, (err, PublicKey, PrivateKey) => { // Callback function
      if(!err)
      {
          fs.writeFile(publicKeyPath, PublicKey.toString('hex'), (er) => {
            if (er) console.log(er);
            console.log("Key Successfully Saved.");
          });
  
          fs.writeFile(privateKeyPath, PrivateKey.toString('hex'), (er) => {
            if (er) console.log(er);
            console.log("Key Successfully Saved.");
          });
          resolve();
  
      }
      else
      {
         // Prints error if any
         console.log("Errr is: ", err);
         reject();
      }
   });

  })

};


exports.getKeywordHash = (keyword) => {
    keyword_hash = crypto.createHmac('sha256', indexKey)
                        .update(keyword)
                        .digest('hex')
    return keyword_hash
  };

exports.getEncryptionKeyword = (pbKey, keyword) => {     //send publickey as a parameter 
  //Store publicKey.key as key file
  //Also pass publicKey.key the file here as a parameter
  //let pbKey = fs.readFileSync('./keys/publicKey.key');

  const encryptedKeyword = crypto.publicEncrypt(
    {
      key: pbKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    
    Buffer.from(keyword)
  )

  //console.log("encypted data: ", encryptedKeyword.toString('hex'));     
  return encryptedKeyword.toString('hex');
}


exports.getDecryptionKeyword = (encryptedKeyword) => {
  let prKey = fs.readFileSync('./keys/privateKey.key');

  const keyword = crypto.privateDecrypt(
    {
      key: prKey,
      passphrase: 'sse',
      padding: crypto.constants.RSA_PKCS8_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encryptedKeyword, 'hex')
  )
  
  //console.log("decrypted data: ", keyword.toString());
  return keyword.toString();
};

exports.getEncryptFile = (pbKey,  filePath) => {     
  //Store publicKey.key as key file
  //Also pass publicKey.key the file here as a parameter
  //let pbKey = fs.readFileSync('./keys/publicKey.key');

  fs.readFile(filePath, "utf-8", (err, data) => {

    const encryptedData = crypto.publicEncrypt(
      {
        key: pbKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      
      Buffer.from(data)
    )

    fs.writeFile(filePath, encryptedData, (error) => {
      if (error) console.log(error);
      //console.log(encryptedData);
      console.log("File Successfully Encrypted."); 
    });
  });
};

//It is for encrypting owner's file data with requester's public key -also output is in HEX
exports.getEncryptFileV2 = (pbKey, filePath ) => {  
  return new Promise( (resolve) => {

    //Store publicKey.key as key file
    //Also pass publicKey.key the file here as a parameter
    //let pbKey = fs.readFileSync('./keys/publicKey.key');
    let againEncryptedfileP = './temp-file/againEncryptFile.txt';
    console.log("Inside encryptFileV2: ");    
    console.log("file data: ", fs.readFileSync(filePath).toString('hex'));
    fs.readFile(filePath, "utf-8" /* "Binary" */ , (err, data) => {    //Store publicKey.key as key file
      //Also pass publicKey.key the file here as a parameter
      //let pbKey = fs.readFileSync('./keys/publicKey.key');
      
      console.log("Inside encryptFileV2: readFile");

      const encryptedData = crypto.publicEncrypt(
        {
          key: pbKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        
        Buffer.from(data)
      )

      fs.writeFile(againEncryptedfileP, encryptedData.toString('hex'), (error) => {
        if (error) console.log(error);
        //console.log("Inside WriteFile:" + encryptedData.toString('hex'));
        console.log("Inside encryptFileV2: writeFile");
        console.log("File Successfully Encrypted."); 
      });
      resolve(againEncryptedfileP); 
    });
      //const encryptedData2 = fs.readFileSync(filePath);
      //return encryptedData2.toString('hex');
    //resolve(againEncryptedfileP);
  });
    //const encryptedData2 = fs.readFileSync(filePath);
    //return encryptedData2.toString('hex');
};

exports.getDecryptFile = (filePath) => {
  return new Promise( (resolve) => {
    
    const plainDataFileP = './temp-file/decryptedFile.txt';
    //let prKey = fs.readFileSync('./keys/privateKey.key'); //toString??
    fs.readFile('./keys/privateKey.key', 'utf8', (err, prKey)=> {
    
      console.log(prKey);

      console.log('In the getDecryptFile(). ');
      console.log(filePath);
      console.log(fs.readFileSync('./public/files/'+filePath)); //its wrong completely
      const tempPath = './public/files/'+ filePath;

      fs.readFile(tempPath, (err, encryptedData) => {
      
        const decryptedData = crypto.privateDecrypt(
          {
            key: prKey,
            passphrase: 'sse',
            padding: crypto.constants.RSA_PKCS8_OAEP_PADDING,
            oaepHash: "sha256",
          },
          encryptedData
        )
          fs.writeFile(plainDataFileP, decryptedData , (error) => {
          console.log('In the getDecryptFile(). writeFile ');      
          if (error) console.log(error);
          console.log(decryptedData);
          console.log("Successfully decrypted.");
        }); 
      });
      resolve(plainDataFileP);
    });  
    console.log('In the getDecryptFile(). outer read-write: ', console.log(fs.readFileSync(plainDataFileP).toString('hex')));
    //resolve(plainDataFileP);
  });
    //return plainDataFilePath;
};

exports.getDecryptFileContent = (fileContent) => {
  console.log("File Content: "+ fileContent);
  let prKey = fs.readFileSync('./keys/privateKey.key');

  const plainData = crypto.privateDecrypt(
    {
      key: prKey,
      passphrase: 'sse',
      padding: crypto.constants.RSA_PKCS8_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(fileContent,'hex')
  )
  
  //console.log("decrypted data: ", keyword.toString());
  return plainData.toString();
};
