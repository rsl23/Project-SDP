import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./src/firebase/config.js";

/**
 * Script untuk membuat admin user pertama kali
 * Run dengan: node create-admin.js
 */

async function createAdminUser() {
  const adminData = {
    name: "Admin BJM Parts",
    email: "admin@bjmparts.com",
    password: "admin123456", // Ganti dengan password yang aman!
  };

  console.log("\n🔐 Creating admin user...\n");

  try {
    // 1. Buat user di Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminData.email,
      adminData.password
    );
    const user = userCredential.user;

    console.log("✅ User created in Firebase Auth");
    console.log("   UID:", user.uid);

    // 2. Update display name
    await updateProfile(user, { displayName: adminData.name });
    console.log("✅ Display name updated");

    // 3. Simpan ke Firestore dengan role admin
    await setDoc(doc(db, "users", user.uid), {
      name: adminData.name,
      email: adminData.email,
      firebase_uid: user.uid,
      role: "admin", // 🔑 Role admin
      auth_provider: "email/password",
      email_verified: user.emailVerified,
      createdAt: serverTimestamp(),
    });

    console.log("✅ User data saved to Firestore with admin role");

    console.log("\n🎉 Admin user created successfully!\n");
    console.log("📧 Email:", adminData.email);
    console.log("🔑 Password:", adminData.password);
    console.log("\n⚠️  IMPORTANT: Change the password after first login!\n");
    console.log("🚀 You can now login at: http://localhost:5173/admin\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating admin user:");

    if (error.code === "auth/email-already-in-use") {
      console.error(
        "   Email already exists. Admin user may already be created."
      );
      console.error(
        "   If you need to make an existing user admin, update Firestore manually:"
      );
      console.error("   Set 'role: admin' in the user document.\n");
    } else {
      console.error("   Error code:", error.code);
      console.error("   Error message:", error.message);
    }

    process.exit(1);
  }
}

// Run the script
createAdminUser();
