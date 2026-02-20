import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

const API_URL = process.env.EXPO_PUBLIC_STRIPE_SERVER_URL ?? 'http://localhost:3001';

interface PayOptions {
  gigId: string;
  amountCents: number;
  posterId?: string;
}

interface PayResult {
  success: boolean;
  paymentIntentId?: string;
}

export function useStripePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const pay = useCallback(async ({ gigId, amountCents, posterId }: PayOptions): Promise<PayResult> => {
    setLoading(true);

    try {
      // 1. Fetch the PaymentIntent client secret from the backend
      const response = await fetch(`${API_URL}/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gigId, amountCents, posterId }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${response.status}`);
      }

      const { clientSecret, paymentIntentId } = await response.json();

      // 2. Initialize the payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'UGig',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // 3. Present the payment sheet to the user
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          return { success: false };
        }
        throw new Error(presentError.message);
      }

      Alert.alert('Payment Successful', 'Your payment has been processed. Funds are held in escrow.');
      return { success: true, paymentIntentId };
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message ?? 'Something went wrong.');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [initPaymentSheet, presentPaymentSheet]);

  return { pay, loading };
}
