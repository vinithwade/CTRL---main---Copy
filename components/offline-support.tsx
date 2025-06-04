"use client";

import { useEffect, useState } from "react";
import { initOfflineSupport } from "@/lib/utils/offline-storage";

export function OfflineSupport() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient) {
      initOfflineSupport();
    }
  }, [isClient]);
  
  return null;
} 