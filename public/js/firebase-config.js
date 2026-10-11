/*
 * Firebase Web App 설정
 *
 * 이 값은 Firebase 웹 앱 설정값이며
 * 모비라이프 API Secret과는 별개입니다.
 */

const firebaseConfig = {
  apiKey:
    "AIzaSyBMs7PYhTPzrqdI2fHl8q8EDAs2avcpt8g",

  authDomain:
    "information-mi.firebaseapp.com",

  projectId:
    "information-mi",

  storageBucket:
    "information-mi.firebasestorage.app",

  messagingSenderId:
    "244136858835",

  appId:
    "1:244136858835:web:c0db706c80cc59dd737026",

  measurementId:
    "G-YWXQ2G1W9E"
};


/*
 * Firebase Web SDK
 *
 * Browser module 방식 사용
 */

import {
  initializeApp
} from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";


/*
 * Firebase 초기화
 */

const firebaseApp =
  initializeApp(
    firebaseConfig
  );


/*
 * 필요하면 다른 JS에서도 접근할 수 있도록
 * 전역에 보관
 */

window.firebaseApp =
  firebaseApp;