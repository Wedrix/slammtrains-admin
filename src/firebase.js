import * as firebase from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAc0Pk2YBC0fiKnIFfbU6iGiV4L_YYIyQc",
  authDomain: "slammtrains-2d580.firebaseapp.com",
  databaseURL: "https://slammtrains-2d580.firebaseio.com",
  projectId: "slammtrains-2d580",
  storageBucket: "slammtrains-2d580.appspot.com",
  messagingSenderId: "568409436120",
  appId: "1:568409436120:web:047a593482d358b438ccad",
  measurementId: "G-4DJDCWPCNE"
};

firebase.initializeApp(firebaseConfig);

export default firebase;