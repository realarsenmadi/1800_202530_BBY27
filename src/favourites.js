// favourites.js

import { auth, db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";


const form = document.getElementById("favForm");
const list = document.getElementById("favList");

let currentUser = null;

// Listen for login state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    console.log("Logged in as:", user.uid);
    loadFavourites();
  } else {
    console.log("No user logged in");
  }
});

// Load favourites from Firestore
async function loadFavourites() {
  list.innerHTML = "";
  const favRef = collection(db, "users", currentUser.uid, "favourites");
  const snapshot = await getDocs(favRef);

  snapshot.forEach((docSnap) => {
    const fav = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${fav.label}</strong>: ${fav.address}
      <button onclick="removeFavourite('${docSnap.id}')">❌</button>
    `;
    list.appendChild(li);
  });
}

// Add new favourite
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const label = document.getElementById("label").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!currentUser) {
    alert("Please log in first!");
    return;
  }

  if (label && address) {
    const favRef = collection(db, "users", currentUser.uid, "favourites");
    await addDoc(favRef, { label, address });
    form.reset();
    loadFavourites();
  }
});

// Delete favourite
window.removeFavourite = async function (favId) {
  const favDoc = doc(db, "users", currentUser.uid, "favourites", favId);
  await deleteDoc(favDoc);
  loadFavourites();
};
