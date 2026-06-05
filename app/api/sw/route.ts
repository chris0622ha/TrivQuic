import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "";
  const sw = `
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "${apiKey}",
  authDomain: "onetap-trivia.firebaseapp.com",
  databaseURL: "https://onetap-trivia-default-rtdb.firebaseio.com",
  projectId: "onetap-trivia",
  storageBucket: "onetap-trivia.firebasestorage.app",
  messagingSenderId: "986046986694",
  appId: "1:986046986694:web:2a4441bf46965ccbb3dac7",
});

const messaging = firebase.messaging();

// webpush.notification is displayed by the browser automatically.
// Calling showNotification here causes a second "New notification from TrivQuic".
// So we do nothing — notificationclick still works below.
messaging.onBackgroundMessage((_payload) => {
  // intentionally empty
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});
`.trim();

  return new NextResponse(sw, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
