/* Firebase Cloud Messaging Service Worker */
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// Firebase configuration
firebase.initializeApp({
    apiKey: "AIzaSyDVc8YtOD5Km-RDhGvww7x8WupcNSpWipc",
    authDomain: "get-it-done-52bb1.firebaseapp.com",
    projectId: "get-it-done-52bb1",
    storageBucket: "get-it-done-52bb1.appspot.com",
    messagingSenderId: "1076164214014",
    appId: "1:1076164214014:web:483731f66c0d931e9ef9af",
    measurementId: "G-69EG6J8WCD"
});

const messaging = firebase.messaging();

/* Show the push when it arrives in the background */
messaging.onBackgroundMessage(payload => {
    const { title, body, icon } = payload.notification;
    self.registration.showNotification(title, { body, icon });
}); 
