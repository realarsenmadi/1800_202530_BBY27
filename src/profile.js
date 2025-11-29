import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged, updateEmail, updatePassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// DOM references
const form = document.getElementById("profile-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const toggle = document.getElementById("theme-toggle");
const logoutBtn = document.getElementById("logout-btn");

// Track if logout is in progress
let loggingOut = false;

// Dark Mode Logic
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  toggle.checked = true;
}

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  }
});

// Logout functionality
logoutBtn.addEventListener("click", async () => {
  try {
    loggingOut = true; // flag logout
    await auth.signOut();
    alert("Logged out successfully!");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error logging out:", error);
    alert("Error logging out: " + error.message);
  } finally {
    loggingOut = false;
  }
});

// Firebase User Profile Logic
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Only redirect if user is not logged in AND not logging out
    if (!loggingOut) {
      alert("Please log in to view your profile.");
      window.location.href = "login.html";
    }
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  // Fill fields from Firestore
  if (docSnap.exists()) {
    const data = docSnap.data();
    nameInput.value = data.name || "";
  }

  emailInput.value = user.email || "";

  // Save changes
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newName = nameInput.value.trim();
    const newEmail = emailInput.value.trim();
    const newPassword = passwordInput.value.trim();

    try {
      // Update Firestore
      await setDoc(
        userRef,
        { name: newName, email: newEmail, updatedAt: new Date() },
        { merge: true }
      );

      // Update Firebase Auth email
      if (newEmail !== user.email) {
        await updateEmail(user, newEmail);
        console.log("Login email updated successfully");
      }

      // Update password if provided
      if (newPassword.length > 0) {
        await updatePassword(user, newPassword);
        console.log("Password updated successfully");
      }

      alert("Profile updated successfully!");
      passwordInput.value = "";
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.code === "auth/requires-recent-login") {
        alert("Please re-login before changing your email or password.");
      } else {
        alert("Error: " + error.message);
      }
    }
  });
});
