
const BACKEND_URL = "https://tai-backend.amaravadhibharath.workers.dev";

export interface PaymentSessionResponse {
    checkout_url: string;
    session_id: string;
}

export const createPaymentSession = async (productId?: string): Promise<PaymentSessionResponse> => {
    try {
        const response = await fetch(`${BACKEND_URL}/create-payment-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId || 'p_standard_monthly', // Default placeholder
                returnUrl: window.location.href // Return to current page
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Payment Error: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Payment Error:", error);
        throw error;
    }
};
