var http = require('http');
var request = require('request');
var rp = require('request-promise');
var firebase = require("firebase");
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "gameapp-bd",
    "private_key_id": "716e7ae182741ea8887d688cf8d4f2f68175d0a5",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCuKY60QLVg6mAt\nfYuK/vd0/iYa4s2lhMtnJw9nWOiu9Vcy4Gm+CzW3pxtU/jXlz6ahencq7qcUgr7Z\n4tuPhepzLUuq12CN783UNQchCYB5rf9ZMNHyg5ENRxbEsBhOMSeqeRBu8XaDp/q+\nWai5eSnwxyTpVLFP1uKSLzaY846IUUc8odmxLU13fAJ6Aeo5n4qObGq9k+0CO1HY\nYzTL/c1Y4Ek2tNlRRl5a7AkR6RRpL7SUQPIpAL0UqMGHWEL9j+Q9bvzFPXVVlTxB\nxVL9p4gcaP61BjfMXiIdw+gL0WQpoqpsE+8xVOeQbsU8urF/u/Ou+Q122vpNdWT7\nJSROkRIJAgMBAAECggEABw+AfWp/p+yMhl+X9gQ44j1w7EdcVKzd5aJJ37PVKA2i\ncbmzE70m2fmMdD1DkFvjGpoJRXxsGdrkk5b8tXR1gSKZlhUZ8RsjDiqxratR0e0F\nxHcEFeezTFVg1Qu6CoZ34BN9IPBJUJRRaCDgpBdHRd9+7bYtI4pXwFspZJlAIqLO\nw1hAf6bP76GTxproC0uwq7XNIeltLelCiPbhQRhTRm3NXH6Az6tyRcB5Q9meUEhL\n6frPbDWdodC+cGDmFw7rIGvzfw5dZczIu3EFVYZ0/9H+NQeMwPv9/Ww/dVvG01GN\n7INnb/wYs5vD9gNaBYDORJxASb1zpDDmigxZ9c8oMQKBgQDdrFmFsJWwWL+vibML\nF+PsERv3raLqlcYkSGxwWIzpiA2HPEPZVsNB8qhpTF3WcyL/Q4RQZuMHk9D5SDsi\nbOTVrA/Pf7RRAkEsWOn34kiaHZsA0sYW0UBl63XSl52gaDZ2PI4vXsuEH3BdLP5L\n81GWiC2VBn4cJU7BPDZAmpmrcQKBgQDJIcNmKYlnuK8DFHisvkwa1/xiRrNrJtwp\nSgTvNdnnaqHzXf/+49UHgOUch9pCrhMlIaV68BXMli9nTYWyvOr4RwDUjZwUcoeM\nURZYldILxy9nHK0mYq9Q8FcINQHxrtyvgxDUJtfNb1W4bglCdB1mNHBm3gOuAJf6\nSdyeGJKUGQKBgQDL3WW3fd8sf3JKjekLmr0Srel6r0XVWEkRtUmFSOrPG0DVzqbX\niuOoEvKvZHwobVsSR5W4G+dPYLIfkD5SOrN5jvQ7cMb0eY5Wqq8COilrEy8qYq2q\n7ma7VQDW3HkqvKzZsHdTOWsR55f/GRIF55BxUGwbUg1I9UaokCeU4pnRAQKBgFS8\n19ED8PL0+S8IAettZSzuEFPrS436Wkk++SM7Aeogn8ijssXVgRvfLye9CLSNGF3N\ndiV8XwLJx4DzRT/PngMqDux+GOL4eakhRJPf0xXJPmxnxX9llk04ZMJ9aqtDK5D6\nXC21i7fujyPboCUSPIyhzTVZlh1J/L2jPsKQwbiJAoGBANwxWQKIUQVFDiLgq00I\nVQXNVCaDubF0FjfXR4/EqsShg9fBoKyWdKGq15x09ZFQZxzHK1dOKlRCsDCRO9A9\n0Qaxb3pkniE5b0YYG5/MB5Nmg3W3Sa22bKZxXYBVejb5e/yG6BmYMST5G9GpzDLf\nsgXOMRmIRZ1ubATkpJz3jvVw\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-1bbne@gameapp-bd.iam.gserviceaccount.com",
    "client_id": "112895872993709764629",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://accounts.google.com/o/oauth2/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-1bbne%40gameapp-bd.iam.gserviceaccount.com"
  }),
  databaseURL: 'https://gameapp-bd.firebaseio.com'
});

function writeJogoData(titulo, anolancamento) {
  admin.database().ref('Jogo/'+titulo).set({
    AnoLancamento: anolancamento,
    Titulo: titulo
  });
}

var steamGameListUrl = 'http://api.steampowered.com/ISteamApps/GetAppList/v0002/';
var steamGameDetailUrl = 'http://store.steampowered.com/api/appdetails?appids=';

function getSteamGameList(){
  rp({
    method: 'GET',
    uri: steamGameListUrl,
    json: true
  }).then(function(res){
    var apps = res.applist.apps;
    var length = apps.length;
    (function delayHttpReqLoop (i) {
       setTimeout(function () {
          getGameDetails(apps[i].appid);
          if (--i) delayHttpReqLoop(i);
       }, 500)
    })(apps.length-1);
  }).catch(function (err) {
      console.log(err);
  });
}

function getGameDetails(appid){
  rp({
    method: 'GET',
    uri: steamGameDetailUrl+appid,
    json: true
  }).then(function (res) {
    var statusSuccess = res[appid].success;

    if(statusSuccess){
      var appDetails = res[appid].data;
      var name = appDetails.name;
      var releaseDate = appDetails.release_date.date;
      var price = "free";
      if(appDetails.is_free == "false"){
        price = appDetails.price_overview.final;
      }

      writeJogoData(name, releaseDate);
    }
  }).catch(function (err) {
      console.log(err);
  });
}

getSteamGameList();
