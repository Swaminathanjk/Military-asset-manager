import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase"; // Adjust path if needed

const TokenFetcher = () => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const fetchToken = async () => {
    const email = "swami1@gmail.com"; // <-- replace with test user email
    const password = "swami1"; // <-- replace with test user password    

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const idToken = await userCredential.user.getIdToken();
      setToken(idToken);
      console.log("Firebase ID Token:", idToken);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={fetchToken}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Get Firebase Token
      </button>

      {token && (
        <div className="mt-4">
          <label className="block font-semibold mb-1">Firebase Token:</label>
          <textarea
            className="w-full h-32 border p-2 text-sm"
            readOnly
            value={token}
          />
        </div>
      )}

      {error && <p className="text-red-500 mt-2">Error: {error}</p>}
    </div>
  );
};

export default TokenFetcher;
