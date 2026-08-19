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
  const [isHydrated, setIsHydrated] = useState(
    () => !store?.persist || store.persist.hasHydrated(),
  );

  useEffect(() => {
    if (!store?.persist) return;

    if (!store.persist.hasHydrated()) {
      const unsubFinishHydration = store.persist.onFinishHydration(() => {
        setIsHydrated(true);
      });

      return () => {
        unsubFinishHydration();
      };
    }
  }, [store]);

  if (!isHydrated) {
    return <>{loading}</>;
  }

  return <>{children}</>;
};

export default PersistGate;
