import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import axios from "axios";

const useCanny = (user: {
  id: string;
  email: string;
  name: string;
  avatarURL?: string;
  created?: string;
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) return;

    const userObj = {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      name: user.name,
      avatarURL: user.avatarURL,
      created: user.created ? new Date(user.created).toISOString() : "",
    };

    axios
      .post(`${backendUrl}/generate-canny-token`, { ...userObj })
      .then(({ data }) => {
        if (window.Canny) {
          window.Canny("identify", {
            appID: "67baf82c2af2bb25805d427a",
            user: { ...userObj, ssoToken: data.token },
          });
        }
      })
      .catch((error) => console.error("CANNY SSO ERROR: ", error));
  }, [user]);
};

export default useCanny;
