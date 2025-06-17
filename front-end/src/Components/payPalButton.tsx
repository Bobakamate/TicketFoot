import React, { useEffect, useRef, useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface PayPalButtonProps {
    amount: number;
    currency?: string;
    description?: string;
    onSuccess?: (orderData: any) => void;
    onError?: (error: any) => void;
    onCancel?: () => void;
    disabled?: boolean;
}

declare global {
    interface Window {
        paypal?: any;
    }
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
                                                       amount,
                                                       currency = 'EUR',
                                                       description = 'Achat de billets',
                                                       onSuccess,
                                                       onError,
                                                       onCancel,
                                                       disabled = false
                                                   }) => {
    const paypalRef = useRef<HTMLDivElement>(null);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Configuration PayPal (hardcodé pour les tests)
    const PAYPAL_CLIENT_ID = "";
    const PAYPAL_SANDBOX_URL = "https://www.paypal.com/sdk/js";

    useEffect(() => {
        // Charger le script PayPal
        const loadPayPalScript = () => {
            if (window.paypal) {
                setIsScriptLoaded(true);
                return;
            }

            const script = document.createElement('script');
            script.src = `${PAYPAL_SANDBOX_URL}?client-id=${PAYPAL_CLIENT_ID}&currency=${currency}&intent=capture`;
            script.async = true;
            script.onload = () => {
                setIsScriptLoaded(true);
            };
            script.onerror = () => {
                setErrorMessage('Erreur lors du chargement de PayPal');
                setPaymentStatus('error');
            };

            document.body.appendChild(script);
        };

        loadPayPalScript();

        return () => {
            // Nettoyer le script si nécessaire
            const scripts = document.querySelectorAll('script[src*="paypal.com"]');
            scripts.forEach(script => {
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            });
        };
    }, [currency]);

    useEffect(() => {
        if (isScriptLoaded && window.paypal && paypalRef.current && !disabled) {
            // Vider le conteneur avant de créer de nouveaux boutons
            paypalRef.current.innerHTML = '';

            window.paypal.Buttons({
                style: {
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'paypal',
                    height: 50
                },

                createOrder: (data: any, actions: any) => {
                    setIsLoading(true);
                    setPaymentStatus('processing');

                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: amount.toFixed(2),
                                currency_code: currency
                            },
                            description: description
                        }],
                        application_context: {
                            brand_name: 'TicketFoot',
                            locale: 'fr-FR',
                            landing_page: 'NO_PREFERENCE',
                            user_action: 'PAY_NOW'
                        }
                    });
                },

                onApprove: async (data: any, actions: any) => {
                    try {
                        const order = await actions.order.capture();
                        console.log('Paiement approuvé:', order);

                        setPaymentStatus('success');
                        setIsLoading(false);

                        if (onSuccess) {
                            onSuccess(order);
                        }
                    } catch (error) {
                        console.error('Erreur lors de la capture:', error);
                        setErrorMessage('Erreur lors de la finalisation du paiement');
                        setPaymentStatus('error');
                        setIsLoading(false);

                        if (onError) {
                            onError(error);
                        }
                    }
                },

                onError: (err: any) => {
                    console.error('Erreur PayPal:', err);
                    setErrorMessage('Erreur lors du paiement PayPal');
                    setPaymentStatus('error');
                    setIsLoading(false);

                    if (onError) {
                        onError(err);
                    }
                },

                onCancel: (data: any) => {
                    console.log('Paiement annulé:', data);
                    setPaymentStatus('idle');
                    setIsLoading(false);

                    if (onCancel) {
                        onCancel();
                    }
                }
            }).render(paypalRef.current);
        }
    }, [isScriptLoaded, amount, currency, description, disabled, onSuccess, onError, onCancel]);

    const getAmountInDH = (eurAmount: number) => {
        return (eurAmount * 10).toFixed(0); // Conversion approximative EUR -> DH
    };

    if (!isScriptLoaded) {
        return (
            <div className="w-full bg-gray-700/50 rounded-lg p-6 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <span className="text-gray-300">Chargement de PayPal...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* Informations de paiement */}
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400 font-medium">Paiement sécurisé PayPal</span>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Montant (DH):</span>
                        <span className="text-white font-semibold">{getAmountInDH(amount)} DH</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Montant ({currency}):</span>
                        <span className="text-white font-semibold">{amount.toFixed(2)} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Description:</span>
                        <span className="text-white">{description}</span>
                    </div>
                </div>
            </div>

            {/* Status du paiement */}
            {paymentStatus === 'processing' && (
                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                        <span className="text-yellow-400 text-sm">Traitement du paiement en cours...</span>
                    </div>
                </div>
            )}

            {paymentStatus === 'success' && (
                <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">Paiement effectué avec succès!</span>
                    </div>
                </div>
            )}

            {paymentStatus === 'error' && (
                <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm">{errorMessage}</span>
                    </div>
                </div>
            )}

            {/* Conteneur du bouton PayPal */}
            <div
                ref={paypalRef}
                className={`w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            />

            {/* Informations de sécurité */}
            <div className="text-center text-xs text-gray-400 space-y-1">
                <p>✓ Paiement sécurisé par PayPal</p>
                <p>✓ Vos informations bancaires restent confidentielles</p>
                <p>✓ Mode sandbox - Aucun vrai paiement ne sera effectué</p>
            </div>
        </div>
    );
};

export default PayPalButton;