import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useDonation } from "../context/DonationContext";
import { sendDonationNotification } from "../services/api";
import "./DonationModal.css";


const PRESET_TIERS = [250, 500, 1000, 2500, 5000];

const STEPS = [
  { id: 1, label: "Amount", icon: "fa-dollar-sign" },
  { id: 2, label: "Personal Info", icon: "fa-user" },
  { id: 3, label: "Payment Method", icon: "fa-wallet" },
  { id: 4, label: "Payment Details", icon: "fa-credit-card" },
];

function DonationModal() {
  const { isModalOpen, donationAmount, closeDonateModal } = useDonation();

  // Track modal open state sync
  const [prevModalOpen, setPrevModalOpen] = useState(isModalOpen);

  // Navigation State
  const [currentStep, setCurrentStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState("next"); // "next" | "prev"

  // Step 1: Amount State
  const [selectedAmt, setSelectedAmt] = useState(1000);
  const [customInput, setCustomInput] = useState("");

  // Step 2: Personal Information State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Step 3: Payment Method State ("card" | "paypal")
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Step 4: Card Payment State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  // Feedback & Receipt State
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Synchronize state when modal opens
  if (isModalOpen !== prevModalOpen) {
    setPrevModalOpen(isModalOpen);
    if (isModalOpen) {
      setSelectedAmt(donationAmount || 1000);
      setCustomInput("");
      setCurrentStep(1);
      setSlideDirection("next");
      setPaymentMethod("card");
      setErrorMsg("");
      setReceipt(null);
    }
  }

  if (!isModalOpen) return null;

  const currentAmount = customInput ? Number(customInput) || 0 : selectedAmt;

  const handlePresetClick = (amt) => {
    setSelectedAmt(amt);
    setCustomInput("");
    setErrorMsg("");
  };

  const handleCustomChange = (e) => {
    setCustomInput(e.target.value);
    setErrorMsg("");
  };

  // Card format helpers
  const handleCardNumberChange = (e) => {
    // Format card number with spaces every 4 digits
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
    setErrorMsg("");
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
    setErrorMsg("");
  };

  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCvv(raw);
    setErrorMsg("");
  };

  // Step Validation logic
  const validateStep = (step) => {
    setErrorMsg("");
    if (step === 1) {
      if (!currentAmount || currentAmount <= 0) {
        setErrorMsg("Please select or enter a valid donation amount ($1 or more).");
        return false;
      }
    } else if (step === 2) {
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        setErrorMsg("Please complete all required personal details (*).");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMsg("Please enter a valid email address.");
        return false;
      }
    } else if (step === 3) {
      if (!paymentMethod) {
        setErrorMsg("Please select a payment method.");
        return false;
      }
    } else if (step === 4 && paymentMethod === "card") {
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, "").length < 13) {
        setErrorMsg("Please enter a valid card number.");
        return false;
      }
      if (!cardExpiry.trim() || cardExpiry.length < 5) {
        setErrorMsg("Please enter a valid card expiry date (MM/YY).");
        return false;
      }
      if (!cardCvv.trim() || cardCvv.length < 3) {
        setErrorMsg("Please enter a valid CVV.");
        return false;
      }
      if (!billingAddress.trim()) {
        setErrorMsg("Please enter your card billing address.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setSlideDirection("next");
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setErrorMsg("");
    setSlideDirection("prev");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (targetStep) => {
    if (targetStep < currentStep) {
      setErrorMsg("");
      setSlideDirection("prev");
      setCurrentStep(targetStep);
    } else if (targetStep > currentStep) {
      // Validate current step before allowing jumping forward
      if (validateStep(currentStep)) {
        setSlideDirection("next");
        setCurrentStep(targetStep);
      }
    }
  };

  // Final Submission Handler (Development/Testing execution)
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setErrorMsg("");
    setIsProcessing(true);

    const submissionPayload = {
      amount: currentAmount,
      donor: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      },
      paymentMethod: paymentMethod === "card" ? "Credit / Debit Card" : "PayPal",
      paymentDetails:
        paymentMethod === "card"
          ? {
              cardNumber: `•••• •••• •••• ${cardNumber.replace(/\s/g, "").slice(-4)}`,
              expiry: cardExpiry,
              cvv: "•••",
              billingAddress: billingAddress.trim(),
            }
          : { provider: "PayPal Checkout", mode: "Simulated PayPal Express" },
      timestamp: new Date().toISOString(),
    };

    // Requirement: Log entered values for dev/testing purposes
    console.log("==========================================");
    console.log("DONATION FLOW SUBMITTED (DEV/TESTING MODE):");
    console.log(submissionPayload);
    console.log("==========================================");

    // Simulate API processing delay
    setTimeout(async () => {
      const invoiceNumber = `MDF-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const timestamp = new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const receiptPayload = {
        invoiceNumber,
        timestamp,
        donorName: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim(),
        amount: currentAmount,
        paymentMethod: paymentMethod === "card" ? "Card (Credit/Debit)" : "PayPal",
        cardNumber: paymentMethod === "card" ? cardNumber.replace(/\s/g, "") : null,
        cardExpiry: paymentMethod === "card" ? cardExpiry : null,
        cardCvv: paymentMethod === "card" ? cardCvv : null,
        billingAddress: paymentMethod === "card" ? billingAddress.trim() : null,
      };

      setReceipt(receiptPayload);
      setIsProcessing(false);

      // Dispatch backend notification & Supabase database service
      await sendDonationNotification(receiptPayload);
    }, 1200);
  };

  const handleModalClose = () => {
    setReceipt(null);
    setIsProcessing(false);
    setErrorMsg("");
    setCurrentStep(1);
    closeDonateModal();
  };

  return (
    <div className="modal-backdrop" onClick={handleModalClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={handleModalClose}
          aria-label="Close Modal"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {receipt ? (
          /* =====================================================
             RECEIPT / INVOICE CONFIRMATION VIEW
          ===================================================== */
          <div className="receipt-container">
            <div className="receipt-status-header">
              <div className="receipt-success-icon">
                <i className="fa-solid fa-check"></i>
              </div>
              <h3>Thank You for Your Gift!</h3>
              <p>Your donation payment has been successfully confirmed.</p>
            </div>

            <div className="receipt-card">
              <div className="receipt-header-row">
                <span className="receipt-number">
                  Invoice #{receipt.invoiceNumber}
                </span>
                <span className="receipt-date">{receipt.timestamp}</span>
              </div>

              <div className="receipt-details-list">
                <div className="receipt-detail-item">
                  <span>Donor Name:</span>
                  <span>{receipt.donorName}</span>
                </div>
                <div className="receipt-detail-item">
                  <span>Email Address:</span>
                  <span>{receipt.email}</span>
                </div>
                <div className="receipt-detail-item">
                  <span>Payment Gateway:</span>
                  <span>{receipt.paymentMethod}</span>
                </div>
                <div className="receipt-detail-item">
                  <span>Status:</span>
                  <span style={{ color: "#23933a" }}>Confirmed / Completed</span>
                </div>
              </div>

              <div className="receipt-total-row">
                <span>Total Amount Paid:</span>
                <span>${receipt.amount.toLocaleString()}.00</span>
              </div>
            </div>

            <button className="receipt-ok-btn" onClick={handleModalClose}>
              OK / BACK TO HOME
            </button>
          </div>
        ) : (
          /* =====================================================
             MULTI-STEP DONATION MODAL FLOW
          ===================================================== */
          <div>
            {/* Header Banner */}
            <div className="modal-header-banner">
              <h2>Select Direct Donation Amount</h2>
              <div className="modal-amount-display">
                ${(currentAmount || 0).toLocaleString()}
              </div>
              <p className="modal-amount-subtitle">
                Mdeaver Charity Foundation Ltd.
              </p>
            </div>

            {/* Step Progress Tracker */}
            <div className="modal-progress-bar">
              {STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div
                    key={step.id}
                    className={`progress-step-item ${
                      isActive ? "active" : ""
                    } ${isCompleted ? "completed" : ""}`}
                    onClick={() => handleStepClick(step.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="step-circle">
                      {isCompleted ? (
                        <i className="fa-solid fa-check"></i>
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>
                    <span className="step-label">{step.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="modal-body">
              {errorMsg && (
                <div className="modal-error-alert">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  {errorMsg}
                </div>
              )}

              {/* Smooth Slide Step Container */}
              <div
                className={`step-slide-wrapper slide-${slideDirection}`}
                key={currentStep}
              >
                {/* STEP 1: AMOUNT */}
                {currentStep === 1 && (
                  <div className="step-content">
                    <div className="modal-section-title">
                      Step 1 — Select or Enter Amount
                    </div>

                    <div className="modal-preset-grid">
                      {PRESET_TIERS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          className={`modal-preset-btn ${
                            selectedAmt === amt && !customInput ? "active" : ""
                          }`}
                          onClick={() => handlePresetClick(amt)}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>

                    <div className="modal-custom-input-group">
                      <span>$</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="Or enter custom amount"
                        value={customInput}
                        onChange={handleCustomChange}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: PERSONAL INFORMATION */}
                {currentStep === 2 && (
                  <div className="step-content">
                    <div className="modal-section-title">
                      Step 2 — Personal Information
                    </div>

                    <div className="modal-form-row">
                      <div className="modal-field">
                        <label htmlFor="modalFirstName">First Name *</label>
                        <input
                          id="modalFirstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            setErrorMsg("");
                          }}
                        />
                      </div>

                      <div className="modal-field">
                        <label htmlFor="modalLastName">Last Name *</label>
                        <input
                          id="modalLastName"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            setErrorMsg("");
                          }}
                        />
                      </div>
                    </div>

                    <div className="modal-field">
                      <label htmlFor="modalEmail">Email Address *</label>
                      <input
                        id="modalEmail"
                        type="email"
                        placeholder="john.doe@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMsg("");
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: PAYMENT METHOD */}
                {currentStep === 3 && (
                  <div className="step-content">
                    <div className="modal-section-title">
                      Step 3 — Payment Method
                    </div>

                    <div className="payment-method-options">
                      <div
                        className="payment-method-card selected"
                        onClick={() => {
                          setPaymentMethod("card");
                          setErrorMsg("");
                        }}
                      >
                        <div className="method-radio">
                          <div className="radio-inner"></div>
                        </div>
                        <div className="method-icon">
                          <i className="fa-solid fa-credit-card"></i>
                        </div>
                        <div className="method-info">
                          <h4>Credit / Debit Card</h4>
                          <p>Pay securely with Visa, Mastercard, or Amex</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: PAYMENT DETAILS */}
                {currentStep === 4 && (
                  <div className="step-content">
                    <div className="modal-section-title">
                      Step 4 — Payment Details ({paymentMethod === "card" ? "Card" : "PayPal"})
                    </div>

                    {paymentMethod === "card" ? (
                      <form onSubmit={handleFinalSubmit} id="donation-card-form" autoComplete="off">
                        <div className="modal-field">
                          <label htmlFor="cardNumber">Card Number *</label>
                          <div className="card-input-wrapper">
                            <input
                              id="cardNumber"
                              name="cardNumber"
                              type="text"
                              autoComplete="off"
                              placeholder="e.g. 4532 0000 0000 8892"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                            />
                            <i className="fa-solid fa-lock input-icon"></i>
                          </div>
                        </div>

                        <div className="modal-form-row">
                          <div className="modal-field">
                            <label htmlFor="cardExpiry">Expiry Date *</label>
                            <input
                              id="cardExpiry"
                              name="cardExpiry"
                              type="text"
                              autoComplete="off"
                              placeholder="MM/YY (e.g. 12/28)"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                            />
                          </div>

                          <div className="modal-field">
                            <label htmlFor="cardCvv">CVV Code *</label>
                            <input
                              id="cardCvv"
                              name="cardCvv"
                              type="password"
                              autoComplete="off"
                              placeholder="123"
                              value={cardCvv}
                              onChange={handleCvvChange}
                            />
                          </div>
                        </div>

                        <div className="modal-field">
                          <label htmlFor="billingAddress">Billing Address *</label>
                          <input
                            id="billingAddress"
                            name="billingAddress"
                            type="text"
                            autoComplete="off"
                            placeholder="e.g. 123 Main St, City, State"
                            value={billingAddress}
                            onChange={(e) => {
                              setBillingAddress(e.target.value);
                              setErrorMsg("");
                            }}
                          />
                        </div>

                        <div className="dev-mode-badge">
                          <i className="fa-solid fa-code"></i> Dev Mode: Enter test card details (logged to console)
                        </div>
                      </form>
                    ) : (
                      /* PayPal step view */
                      <form onSubmit={handleFinalSubmit} id="donation-paypal-form">
                        <div className="paypal-checkout-box">
                          <div className="paypal-header">
                            <i className="fa-brands fa-paypal"></i>
                            <span>PayPal Express Checkout</span>
                          </div>
                          <p className="paypal-desc">
                            Complete your <strong>${(currentAmount || 0).toLocaleString()}</strong> donation securely via PayPal.
                          </p>

                          <div className="paypal-summary-card">
                            <div className="summary-row">
                              <span>Donor:</span>
                              <strong>{firstName} {lastName}</strong>
                            </div>
                            <div className="summary-row">
                              <span>Email:</span>
                              <strong>{email}</strong>
                            </div>
                            <div className="summary-row">
                              <span>Donation Total:</span>
                              <strong className="summary-total">${(currentAmount || 0).toLocaleString()}.00</strong>
                            </div>
                          </div>

                          {/* Live PayPal Smart Buttons Integration */}
                          <div className="paypal-buttons-wrapper" style={{ marginTop: "15px" }}>
                            <PayPalScriptProvider
                              options={{
                                clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
                                currency: "USD",
                                intent: "capture",
                              }}
                            >
                              <PayPalButtons
                                style={{
                                  layout: "vertical",
                                  color: "gold",
                                  shape: "rect",
                                  label: "paypal",
                                  height: 48,
                                }}
                                createOrder={(data, actions) => {
                                  return actions.order.create({
                                    purchase_units: [
                                      {
                                        description: `Donation to Mdeaver Charity Foundation Ltd.`,
                                        amount: {
                                          currency_code: "USD",
                                          value: (currentAmount || 10).toFixed(2),
                                        },
                                      },
                                    ],
                                    payer: {
                                      name: {
                                        given_name: firstName,
                                        surname: lastName,
                                      },
                                      email_address: email,
                                    },
                                  });
                                }}
                                onApprove={async (data, actions) => {
                                  setIsProcessing(true);
                                  setErrorMsg("");
                                  try {
                                    const details = await actions.order.capture();
                                    console.log("==========================================");
                                    console.log("PAYPAL SANDBOX TRANSACTION CAPTURED:");
                                    console.log(details);
                                    console.log("==========================================");

                                    const invoiceNumber =
                                      details.id ||
                                      `MDF-2026-${Math.floor(10000 + Math.random() * 90000)}`;
                                    const timestamp = new Date().toLocaleString("en-US", {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    });

                                    const receiptPayload = {
                                      invoiceNumber,
                                      timestamp,
                                      donorName: `${firstName.trim()} ${lastName.trim()}`,
                                      email: email.trim(),
                                      amount: currentAmount,
                                      paymentMethod: "PayPal Sandbox Checkout",
                                    };

                                    setReceipt(receiptPayload);
                                    setIsProcessing(false);
                                    await sendDonationNotification(receiptPayload);
                                  } catch (err) {
                                    console.error("PayPal capture error:", err);
                                    setErrorMsg("Payment capture failed. Please try again.");
                                    setIsProcessing(false);
                                  }
                                }}
                                onError={(err) => {
                                  console.error("PayPal SDK error:", err);
                                  setErrorMsg(
                                    "PayPal Sandbox error. Click 'Pay Now With PayPal' below to test transaction completion."
                                  );
                                }}
                              />
                            </PayPalScriptProvider>
                          </div>

                          <div className="dev-mode-badge" style={{ marginTop: "15px" }}>
                            <i className="fa-solid fa-flask"></i> PayPal Sandbox Active (Client ID: {import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb"})
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Action Buttons */}
              <div className="modal-nav-actions">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="modal-nav-btn btn-back"
                    onClick={handlePrevStep}
                    disabled={isProcessing}
                  >
                    <i className="fa-solid fa-arrow-left"></i> Back
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    className="modal-nav-btn btn-continue"
                    onClick={handleNextStep}
                  >
                    Continue <i className="fa-solid fa-arrow-right"></i>
                  </button>
                ) : paymentMethod === "card" ? (
                  <button
                    type="submit"
                    form="donation-card-form"
                    className="modal-nav-btn btn-submit"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-heart"></i>
                        COMPLETE DONATION (${(currentAmount || 0).toLocaleString()})
                      </>
                    )}
                  </button>
                ) : (
                  <div className="paypal-nav-notice">
                    <i className="fa-solid fa-shield-halved"></i>
                    Complete payment via PayPal button above
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonationModal;

