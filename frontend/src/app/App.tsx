import { useEffect, useState } from "react";
import { Providers } from "@/app/providers";
import { AppRouter } from "@/app/router";
import { AppLoadingScreen } from "@/components/common/AppLoadingScreen";

export function App() {
  const [loadingVisible, setLoadingVisible] = useState(true);
  const [loaderExiting, setLoaderExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => setLoaderExiting(true), 2200);
    const hideTimer = window.setTimeout(() => setLoadingVisible(false), 2500);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <Providers>
      {loadingVisible ? <AppLoadingScreen exiting={loaderExiting} /> : <AppRouter />}
    </Providers>
  );
}
