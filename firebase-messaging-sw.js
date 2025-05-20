/* Firebase Cloud Messaging Service Worker */
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDVc8YtOD5Km-RDhGvww7x8WupcNSpWipc",
    authDomain: "get-it-done-52bb1.firebaseapp.com",
    projectId: "get-it-done-52bb1",
    messagingSenderId: "1076164214014",
    appId: "1:1076164214014:web:483731f66c0d931e9ef9af"
});

const messaging = firebase.messaging();

/* Show the push when it arrives in the background */
messaging.onBackgroundMessage(({ notification }) => {
    self.registration.showNotification(notification.title, notification);
}); 
