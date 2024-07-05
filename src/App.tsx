import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import routes from "./Route";
// import { BrowserRouter, Route, RouterProvider, Routes } from "react-router-dom";
import { getDatabase, ref, set, onDisconnect, serverTimestamp } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function App() {
  useEffect(() => {
    const auth = getAuth();
    const database = getDatabase();
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userStatusDatabaseRef = ref(database, `status/${user.uid}`);

        const isOfflineForDatabase = {
          state: 'offline',
          last_changed: serverTimestamp(),
        };

        const isOnlineForDatabase = {
          state: 'online',
          last_changed: serverTimestamp(),
        };

        set(userStatusDatabaseRef, isOnlineForDatabase);

        onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase);

        window.addEventListener('beforeunload', () => {
          set(userStatusDatabaseRef, isOfflineForDatabase);
        });

        return () => {
          window.removeEventListener('beforeunload', () => {
            set(userStatusDatabaseRef, isOfflineForDatabase);
          });
        };
      }
    });
  }, []);
  return (
    <>
      <RouterProvider router={routes} />;
    </>
  );
}

export default App;
