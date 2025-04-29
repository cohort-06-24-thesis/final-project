import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User is logged in:', user.email);
    } else {
      console.log('User is logged out');
    }
  });

  return unsubscribe;
}, []);
