
import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web"

export const CrispChat = () => {
    useEffect(() => {
        // Crisp.configure("b4da2e8e-688d-4c7f-ae4a-310777c73488")
        Crisp.configure("e4f34063-228f-4ae1-8f14-ce9a5b7d4a1d")
    }, []);
    return null;
}