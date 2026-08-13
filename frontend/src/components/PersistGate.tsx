import React, { useEffect, useState } from "react";

interface PersistGateProps {
  children: React.ReactNode;
  loading?: React.ReactNode;
  store: any; // Type as any to support different Zustand stores
}

export const PersistGate: React.FC<PersistGateProps> = ({
  children,
  loading = null,
  store,
}) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // If the store is not using persist middleware, bypass
    if (!store?.persist) {
      setIsHydrated(true);
      return;
    }

    // Set initial state
    setIsHydrated(store.persist.hasHydrated());

    // Listen for hydration finish
    const unsubFinishHydration = store.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return () => {
      unsubFinishHydration();
    };
  }, [store]);

  if (!isHydrated) {
    return <>{loading}</>;
  }

  return <>{children}</>;
};

export default PersistGate;
