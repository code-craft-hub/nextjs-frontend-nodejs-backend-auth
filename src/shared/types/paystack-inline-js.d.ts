declare module '@paystack/inline-js' {
    interface PaystackPop {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
        callback: (response: any) => void;
        onClose?: () => void;
      }) => { openIframe: () => void };
    }
    const PaystackPop: PaystackPop;
    export default PaystackPop;
  }