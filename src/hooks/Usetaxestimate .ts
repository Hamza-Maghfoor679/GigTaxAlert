import { useEffect, useRef, useState } from 'react';
import { getAuth } from '@react-native-firebase/auth';
import { collection, doc, getDocs, getFirestore, limit, orderBy, query } from '@react-native-firebase/firestore';

import type { TaxEstimate } from '@/components/ui/homeComponents/deadline.types';
import { useUserProfile } from '@/context/UserProfileContext';

type EstimateDoc = {
  quarterlyOwed?: number;
  amount?: number;
  currency?: 'USD' | 'GBP' | 'EUR' | string;
  period?: string;
};

export function useTaxEstimate(): { estimate: TaxEstimate | null } {
  const [estimate, setEstimate] = useState<TaxEstimate | null>(null);
  const { subscriptionTier, country } = useUserProfile();
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const loadEstimate = async () => {
      if (subscriptionTier === null || country === null) {
        if (!mounted.current) return;
        setEstimate(null);
        return;
      }

      if (subscriptionTier !== 'pro') {
        if (!mounted.current) return;
        setEstimate(null);
        return;
      }

      const uid = getAuth().currentUser?.uid;
      if (!uid) {
        if (!mounted.current) return;
        setEstimate(null);
        return;
      }

      try {
        const db = getFirestore();
        const estimatesRef = collection(doc(collection(db, 'users'), uid), 'estimates');
        const latestEstimateQuery = query(estimatesRef, orderBy('createdAt', 'desc'), limit(1));
        const snap = await getDocs(latestEstimateQuery);

        if (snap.empty) {
          if (!mounted.current) return;
          setEstimate(null);
          return;
        }

        const latest = snap.docs[0].data() as EstimateDoc;
        const rawAmount = latest.quarterlyOwed ?? latest.amount ?? 0;
        const currency = latest.currency;

        if (currency !== 'USD' && currency !== 'GBP' && currency !== 'EUR') {
          if (!mounted.current) return;
          setEstimate(null);
          return;
        }

        const mapped: TaxEstimate = {
          quarterlyOwed: Math.round(rawAmount),
          currency,
          period: latest.period ?? '',
          isEstimate: true,
        };

        if (!mounted.current) return;
        setEstimate(mapped);
      } catch (error) {
        console.error('[useTaxEstimate] fetch failed:', error);
        if (!mounted.current) return;
        setEstimate(null);
      }
    };

    void loadEstimate();
  }, [country, subscriptionTier]);

  return { estimate };
}