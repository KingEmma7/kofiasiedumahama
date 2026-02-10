'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  CreditCardIcon,
  CheckIcon,
  ArrowDownTrayIcon,
  TruckIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import { trackEvent } from './Analytics';

// Pricing configuration
const HARDCOPY_PRICE = Number.parseInt(process.env.NEXT_PUBLIC_HARDCOPY_PRICE || '99');
const EBOOK_PRICE = Number.parseInt(process.env.NEXT_PUBLIC_EBOOK_PRICE || '89');

interface PaymentState {
  loading: boolean;
  success: boolean;
  error: string | null;
  downloadUrl: string | null;
  reference: string | null;
  emailSent: boolean;
}

interface DeliveryAddress {
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export function PaymentSection() {
  const [bookType, setBookType] = useState<'ebook' | 'hardcopy' | 'bundle'>('hardcopy');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: 'Ghana',
  });
  const [paymentState, setPaymentState] = useState<PaymentState>({
    loading: false,
    success: false,
    error: null,
    downloadUrl: null,
    reference: null,
    emailSent: false,
  });

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const totalPrice = bookType === 'hardcopy' ? HARDCOPY_PRICE : EBOOK_PRICE;

  // Handle Paystack payment
  const handlePayment = useCallback(async () => {
    if (!email || !name) {
      setPaymentState(prev => ({ ...prev, error: 'Please enter your name and email' }));
      return;
    }

    // Validate hardcopy delivery details
    if (bookType === 'hardcopy') {
      if (!phone) {
        setPaymentState(prev => ({ ...prev, error: 'Phone number is required for hardcopy delivery' }));
        return;
      }
      if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.region) {
        setPaymentState(prev => ({ ...prev, error: 'Please complete all delivery address fields' }));
        return;
      }
    }

    // Track payment initiation
    trackEvent('payment_initiated', 'ecommerce', bookType, totalPrice);

    setPaymentState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Dynamically import Paystack
      const PaystackPop = (await import('@paystack/inline-js')).default;
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY || '',
        email: email,
        amount: totalPrice * 100, // Paystack uses kobo/pesewas
        currency: 'GHS',
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: name,
            },
            {
              display_name: 'Product',
              variable_name: 'product',
              value: (() => {
                if (bookType === 'hardcopy') return 'Hardcopy Book';
                if (bookType === 'bundle') return 'Bundle';
                return 'eBook';
              })(),
            },
            ...(phone ? [{
              display_name: 'Phone',
              variable_name: 'phone',
              value: phone,
            }] : []),
            ...(bookType === 'hardcopy' ? [{
              display_name: 'Delivery Address',
              variable_name: 'delivery_address',
              value: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.region}, ${deliveryAddress.postalCode}, ${deliveryAddress.country}`,
            }] : []),
          ],
        },
        onSuccess: (transaction: { reference: string }) => {
          // Verify payment on backend
          void (async () => {
            try {
              const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  reference: transaction.reference,
                  email,
                  name,
                  phone: phone || undefined,
                  bookType,
                  includeBundle: bookType === 'bundle',
                  deliveryAddress: bookType === 'hardcopy' ? deliveryAddress : undefined,
                }),
              });

              const data = await response.json();

              if (data.success) {
                setPaymentState({
                  loading: false,
                  success: true,
                  error: null,
                  downloadUrl: data.downloadUrl,
                  reference: transaction.reference,
                  emailSent: data.emailSent ?? false,
                });
                trackEvent('payment_success', 'ecommerce', bookType, totalPrice);
              } else {
                throw new Error(data.message || 'Payment verification failed');
              }
            } catch (verifyError) {
              console.error('Verification error:', verifyError);
              setPaymentState(prev => ({
                ...prev,
                loading: false,
                error: 'Payment received but verification failed. Please contact support.',
                reference: transaction.reference,
              }));
            }
          })();
        },
        onCancel: () => {
          setPaymentState(prev => ({
            ...prev,
            loading: false,
            error: 'Payment was cancelled',
          }));
          trackEvent('payment_cancelled', 'ecommerce', bookType);
        },
      });
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize payment. Please try again.',
      }));
    }
  }, [email, name, phone, bookType, totalPrice, deliveryAddress]);

  // Build success message based on book type and email status
  function getSuccessMessage(): React.ReactNode {
    const isEbookOrBundle = bookType === 'ebook' || bookType === 'bundle';
    if (isEbookOrBundle && paymentState.emailSent) {
      return <> A confirmation email with your download link has been sent to <strong>{email}</strong>. You can also click below to download immediately.</>;
    }
    if (isEbookOrBundle) {
      return <> You can download your book using the button below.</>;
    }
    if (paymentState.emailSent) {
      return <> A confirmation email has been sent to <strong>{email}</strong>. We will contact you shortly at <strong>{phone || email}</strong> to arrange delivery of your hardcopy book to the address you provided.</>;
    }
    return <> We will contact you shortly at <strong>{phone || email}</strong> to arrange delivery of your hardcopy book to the address you provided.</>;
  }

  // Success state
  if (paymentState.success) {
    return (
      <section
        id="payment"
        className="section-padding bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900"
      >
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="card p-8 md:p-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="heading-md text-gray-900 dark:text-white mb-4">
                Thank You for Your Purchase!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your payment was successful!{getSuccessMessage()}
              </p>
              {!paymentState.emailSent && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                  Note: We could not send the confirmation email. Please save your reference number and download your book now.
                </p>
              )}
              {(bookType === 'ebook' || bookType === 'bundle') && paymentState.downloadUrl && (
                <a
                  href={paymentState.downloadUrl}
                  className="btn-primary inline-flex items-center text-lg"
                  download
                >
                  <ArrowDownTrayIcon className="w-6 h-6 mr-2" />
                  Download Your eBook
                </a>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                Reference: {paymentState.reference}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="payment"
      className="section-padding bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900"
      aria-labelledby="payment-heading"
    >
      <div className="section-container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold mb-6">
            <ShieldCheckIcon className="w-4 h-4" />
            Secure Checkout
          </span>
          <h2 id="payment-heading" className="heading-lg text-gray-900 dark:text-white mb-4">
            Get Your Copy Today
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose your preferred format and start your wealth-building journey
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          {/* Hardcopy option */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`card p-6 md:p-8 cursor-pointer transition-all duration-300 ${
              bookType === 'hardcopy'
                ? 'ring-2 ring-primary-600 dark:ring-primary-400 shadow-xl'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setBookType('hardcopy')}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TruckIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Hardcopy Book
                  </h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Physical book delivered to you
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  bookType === 'hardcopy'
                    ? 'border-primary-600 bg-primary-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {bookType === 'hardcopy' && <CheckIcon className="w-4 h-4 text-white" />}
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                ₵{HARDCOPY_PRICE}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">GHS</span>
            </div>

            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                Physical hardcopy book
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                Premium quality printing
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                Delivered to your location
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                Perfect for gifting
              </li>
            </ul>
          </motion.div>

          {/* eBook option */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`card p-6 md:p-8 cursor-pointer transition-all duration-300 relative ${
              bookType === 'ebook'
                ? 'ring-2 ring-gold-500 dark:ring-gold-400 shadow-xl'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setBookType('ebook')}
          >
            {/* Popular badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
              INSTANT ACCESS
            </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DevicePhoneMobileIcon className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    eBook (PDF)
                  </h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Digital download, instant access
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  bookType === 'ebook'
                    ? 'border-gold-500 bg-gold-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {bookType === 'ebook' && <CheckIcon className="w-4 h-4 text-white" />}
              </div>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                ₵{EBOOK_PRICE}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">GHS</span>
              <span className="ml-2 text-sm text-gold-600 dark:text-gold-400 font-medium">
                Save ₵{HARDCOPY_PRICE - EBOOK_PRICE}!
              </span>
            </div>

            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <CheckIcon className="w-5 h-5 text-gold-500 flex-shrink-0" />
                Digital eBook (PDF format)
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <CheckIcon className="w-5 h-5 text-gold-500 flex-shrink-0" />
                Instant download access
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <CheckIcon className="w-5 h-5 text-gold-500 flex-shrink-0" />
                Read on any device
              </li>
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <CheckIcon className="w-5 h-5 text-gold-500 flex-shrink-0" />
                Lifetime access
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Checkout form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-xl mx-auto"
        >
          <div className="card p-6 md:p-8">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 text-center">
              Complete Your Purchase
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           transition-all duration-200"
                  placeholder="Enter your name"
                  required
                  aria-describedby={paymentState.error ? 'payment-name-error' : undefined}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           transition-all duration-200"
                  placeholder="you@example.com"
                  required
                  aria-describedby={paymentState.error ? 'payment-email-error' : undefined}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number {bookType === 'hardcopy' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                           bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           transition-all duration-200"
                  placeholder="+233 XX XXX XXXX"
                  required={bookType === 'hardcopy'}
                />
              </div>

              {/* Delivery Address - Only for hardcopy */}
              {bookType === 'hardcopy' && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Delivery Address</h4>
                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      autoComplete="street-address"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                               bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               transition-all duration-200"
                      placeholder="House number and street name"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        autoComplete="address-level2"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                                 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                 transition-all duration-200"
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Region/State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="region"
                        name="region"
                        autoComplete="address-level1"
                        value={deliveryAddress.region}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, region: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                                 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                 transition-all duration-200"
                        placeholder="Region"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        autoComplete="postal-code"
                        value={deliveryAddress.postalCode}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                                 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                 transition-all duration-200"
                        placeholder="Postal code"
                      />
                    </div>
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        autoComplete="country"
                        value={deliveryAddress.country}
                        onChange={(e) => setDeliveryAddress(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                                 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                 transition-all duration-200"
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {paymentState.error && (
              <div 
                id="payment-error"
                role="alert"
                aria-live="polite"
                className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
              >
                <strong className="font-semibold">Error: </strong>
                {paymentState.error}
              </div>
            )}

            {/* Order summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-300">
                  {bookType === 'hardcopy' ? 'Hardcopy Book' : 'eBook (PDF)'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ₵{totalPrice}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-xl text-primary-600 dark:text-primary-400">
                  ₵{totalPrice} GHS
                </span>
              </div>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePayment}
              disabled={paymentState.loading || !email || !name || (bookType === 'hardcopy' && (!phone || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.region))}
              className="w-full btn-primary text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentState.loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCardIcon className="w-5 h-5" />
                  Pay ₵{totalPrice} with Paystack
                </>
              )}
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-6 text-gray-400 dark:text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <LockClosedIcon className="w-4 h-4" />
                <span>SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Verified by Paystack</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
