"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PublicFormWrapper from "@/components/PublicFormWrapper";
import { FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "react-toastify";
import { Suspense } from "react";
import AgreementClauses from "@/components/AgreementClauses";

function MidRangeAgreementContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const signatureRef = useRef(null);

  const [clientEmail, setClientEmail] = useState("");
  const [clientUuid, setClientUuid] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedUuid, setSubmittedUuid] = useState(null);

  const [formData, setFormData] = useState({
    fullLegalName: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    gpName: "",
    gpPracticeName: "",
    gpPracticePhone: "",
    currentAddress: "",
    signatureDate: new Date().toISOString().split("T")[0],
    termsAgreed: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const email = searchParams.get("email");
    const uuid =
      searchParams.get("client_uuid") ||
      searchParams.get("uuid") ||
      searchParams.get("client_id");

    if (!email && !uuid) {
      setError(
        "Missing access token. Please use the link provided in your email.",
      );
      setLoading(false);
      return;
    }

    const fetchClientData = async () => {
      try {
        setLoading(true);
        // If we have a uuid, fetch full client details to prefill the form
        if (uuid) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/client-agreement/prefill/${uuid}`,
          );
          if (response.ok) {
            const result = await response.json();
            const clientData = result.data || result;

            setClientEmail(clientData.email || email || "");
            setClientUuid(uuid);
            setFormData((prev) => ({
              ...prev,
              fullLegalName: clientData.name || "",
              currentAddress:
                clientData.current_address ||
                (clientData.address
                  ? `${clientData.address}${clientData.postcode ? `, ${clientData.postcode}` : ""}`
                  : ""),
              emergencyContactName: clientData.emergency_contact_name || "",
              emergencyContactPhone: clientData.emergency_contact_phone || "",
              emergencyContactRelationship:
                clientData.emergency_contact_relationship || "",
              gpName: clientData.gp_name || "",
              gpPracticeName: clientData.gp_practice_name || "",
              gpPracticePhone: clientData.gp_practice_phone || "",
            }));
          } else {
            setClientEmail(email || "");
            setClientUuid(uuid || "");
          }
        } else {
          setClientEmail(email || "");
          setClientUuid("");
        }
      } catch (err) {
        console.error("Error fetching client for agreement:", err);
        setClientEmail(email || "");
        setClientUuid(uuid || "");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [searchParams]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      if (errors.signature) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.signature;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullLegalName.trim())
      newErrors.fullLegalName = "Full legal name is required";
    if (!formData.emergencyContactName.trim())
      newErrors.emergencyContactName = "Emergency contact name is required";
    if (!formData.emergencyContactRelationship.trim())
      newErrors.emergencyContactRelationship = "Relationship is required";
    if (!formData.emergencyContactPhone.trim())
      newErrors.emergencyContactPhone = "Emergency contact phone is required";
    if (!formData.gpName.trim()) newErrors.gpName = "GP name is required";
    if (!formData.gpPracticeName.trim())
      newErrors.gpPracticeName = "GP practice name is required";
    if (!formData.gpPracticePhone.trim())
      newErrors.gpPracticePhone = "Practice phone is required";
    if (!formData.currentAddress.trim())
      newErrors.currentAddress = "Current address is required";
    if (!formData.termsAgreed)
      newErrors.termsAgreed = "You must confirm you have read and agree to the agreement";

    if (signatureRef.current && signatureRef.current.isEmpty()) {
      newErrors.signature = "Signature is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const signatureDataUrl = signatureRef.current.toDataURL();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/client-agreement/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: clientEmail,
            client_uuid: clientUuid,
            full_name: formData.fullLegalName,
            emergency_contact_name: formData.emergencyContactName,
            emergency_contact_relationship:
              formData.emergencyContactRelationship,
            emergency_contact_phone: formData.emergencyContactPhone,
            gp_name: formData.gpName,
            gp_practice_name: formData.gpPracticeName,
            gp_practice_phone: formData.gpPracticePhone,
            current_address: formData.currentAddress,
            signature_data: signatureDataUrl,
            signature_date: new Date().toISOString().split("T")[0],
            terms_agreed: formData.termsAgreed,
            service_type: "Mid Range",
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit agreement");
      }

      const data = await response.json();

      toast.success("Agreement submitted successfully!");
      setSubmittedUuid(clientUuid || data.client_uuid);
    } catch (error) {
      console.error("Error submitting agreement:", error);
      toast.error(
        error.message || "Failed to submit agreement. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PublicFormWrapper>
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--bg-secondary)" }}
        >
          <div className="text-center">
            <Loader2
              className="animate-spin h-12 w-12 mx-auto mb-4"
              style={{ color: "var(--primary)" }}
            />
            <p style={{ color: "var(--text-secondary)" }}>
              Loading agreement form...
            </p>
          </div>
        </div>
      </PublicFormWrapper>
    );
  }

  if (error) {
    return (
      <PublicFormWrapper>
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: "var(--bg-secondary)" }}
        >
          <div className="card rounded-2xl shadow-xl p-8 max-w-md w-full text-center border">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                backgroundColor: "var(--error-bg)",
                border: "2px solid var(--error-border)",
              }}
            >
              <AlertCircle
                className="w-12 h-12"
                style={{ color: "var(--error-primary)" }}
              />
            </div>
            <h2
              className="text-2xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Error Loading Agreement
            </h2>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              {error}
            </p>
          </div>
        </div>
      </PublicFormWrapper>
    );
  }

  if (submittedUuid) {
    const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/client-agreement/download/${submittedUuid}`;
    return (
      <PublicFormWrapper>
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: "var(--bg-secondary)" }}
        >
          <div className="card rounded-2xl shadow-xl p-8 max-w-md w-full text-center border">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                backgroundColor: "var(--success-bg, #dcfce7)",
                border: "2px solid var(--success-border, #86efac)",
              }}
            >
              <CheckCircle className="w-12 h-12" style={{ color: "#16a34a" }} />
            </div>
            <h2
              className="text-2xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Agreement Signed
            </h2>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              Thank you. Your signed agreement has been recorded. You can
              download a PDF copy for your records below.
            </p>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 mb-3 rounded-lg text-base font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              Download PDF Copy
            </a>
            <button
              type="button"
              onClick={() =>
                (window.location.href = `/client-booking?uuid=${submittedUuid}`)
              }
              className="block w-full py-3 rounded-lg text-base font-semibold"
              style={{
                border: "1px solid var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              Continue to Book Your Consultation
            </button>
          </div>
        </div>
      </PublicFormWrapper>
    );
  }

  return (
    <PublicFormWrapper>
      <div
        className="min-h-screen py-8"
        style={{ background: "var(--bg-secondary)" }}
      >
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="card rounded-2xl shadow-xl p-8 mb-6 border text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h1
              className="text-3xl font-bold mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Client Agreement
            </h1>
            <p
              className="text-lg mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Mid-Range Service Agreement
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Client Email: <strong>{clientEmail}</strong>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="card rounded-2xl shadow-xl p-8 mb-6 border">
              {/* Full Legal Name */}
              <div className="mb-6">
                <label
                  className="block text-base font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Full Legal Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullLegalName}
                  onChange={(e) =>
                    handleInputChange("fullLegalName", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border text-base"
                  style={{
                    borderColor: errors.fullLegalName
                      ? "var(--error-primary)"
                      : "var(--border-color)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Enter your full legal name"
                />
                {errors.fullLegalName && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--error-primary)" }}
                  >
                    {errors.fullLegalName}
                  </p>
                )}
              </div>

              {/* Full Agreement Text */}
              <div className="mb-6">
                <AgreementClauses variant="mid-range" />
                <label className="flex items-start gap-3 cursor-pointer mt-4">
                  <input
                    type="checkbox"
                    checked={formData.termsAgreed}
                    onChange={(e) =>
                      handleInputChange("termsAgreed", e.target.checked)
                    }
                    className="mt-1 w-5 h-5 rounded"
                  />
                  <span
                    className="text-base font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    I have read and agree to the terms and conditions above,
                    including the prohibition against recording any sessions.{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.termsAgreed && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--error-primary)" }}
                  >
                    {errors.termsAgreed}
                  </p>
                )}
              </div>

              {/* Emergency Contact Section */}
              <div className="mb-6">
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Emergency Contact Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-base font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Your Emergency Contact Name{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactName",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 rounded-lg border text-base"
                      style={{
                        borderColor: errors.emergencyContactName
                          ? "var(--error-primary)"
                          : "var(--border-color)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="Enter emergency contact name"
                    />
                    {errors.emergencyContactName && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--error-primary)" }}
                      >
                        {errors.emergencyContactName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-base font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Relationship To You{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.emergencyContactRelationship}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactRelationship",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 rounded-lg border text-base"
                      style={{
                        borderColor: errors.emergencyContactRelationship
                          ? "var(--error-primary)"
                          : "var(--border-color)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <option value="">Select relationship...</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Partner">Partner</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Friend">Friend</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.emergencyContactRelationship && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--error-primary)" }}
                      >
                        {errors.emergencyContactRelationship}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-base font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Contact Number (of the Emergency Contact){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactPhone",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-3 rounded-lg border text-base"
                      style={{
                        borderColor: errors.emergencyContactPhone
                          ? "var(--error-primary)"
                          : "var(--border-color)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="Enter phone number"
                    />
                    {errors.emergencyContactPhone && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--error-primary)" }}
                      >
                        {errors.emergencyContactPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* GP Information Section */}
              <div className="mb-6">
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  GP Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      className="block text-base font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Name of your GP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.gpName}
                      onChange={(e) =>
                        handleInputChange("gpName", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border text-base"
                      style={{
                        borderColor: errors.gpName
                          ? "var(--error-primary)"
                          : "var(--border-color)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="Enter your GP's name"
                    />
                    {errors.gpName && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--error-primary)" }}
                      >
                        {errors.gpName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-base font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Name of GP Practice{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.gpPracticeName}
                      onChange={(e) =>
                        handleInputChange("gpPracticeName", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border text-base"
                      style={{
                        borderColor: errors.gpPracticeName
                          ? "var(--error-primary)"
                          : "var(--border-color)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="Enter GP practice name"
                    />
                    {errors.gpPracticeName && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--error-primary)" }}
                      >
                        {errors.gpPracticeName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-base font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Practice Tel <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.gpPracticePhone}
                      onChange={(e) =>
                        handleInputChange("gpPracticePhone", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border text-base"
                      style={{
                        borderColor: errors.gpPracticePhone
                          ? "var(--error-primary)"
                          : "var(--border-color)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="Enter practice phone number"
                    />
                    {errors.gpPracticePhone && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--error-primary)" }}
                      >
                        {errors.gpPracticePhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Address */}
              <div className="mb-6">
                <label
                  className="block text-base font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Your Complete Current Address (Where you reside at){" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.currentAddress}
                  onChange={(e) =>
                    handleInputChange("currentAddress", e.target.value)
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border text-base"
                  style={{
                    borderColor: errors.currentAddress
                      ? "var(--error-primary)"
                      : "var(--border-color)",
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Enter your complete current address including postcode"
                />
                {errors.currentAddress && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--error-primary)" }}
                  >
                    {errors.currentAddress}
                  </p>
                )}
              </div>

              {/* Ongoing Therapy Management */}
              <div className="mb-6">
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Ongoing Therapy Management
                </h3>
                <div
                  className="p-4 rounded-lg space-y-4"
                  style={{ backgroundColor: "var(--bg-secondary)" }}
                >
                  <div>
                    <h4
                      className="font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      48-hour booking rule monitoring:
                    </h4>
                    <ul
                      className="list-disc pl-5 space-y-2 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <li>
                        Client must book sessions 48 hours prior, as after this
                        time our booking system automatically closes the session
                        slot for that week.
                      </li>
                      <li>System sends reminder.</li>
                    </ul>
                  </div>
                  <div>
                    <h4
                      className="font-semibold mb-2"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Session continuity:
                    </h4>
                    <ul
                      className="list-disc pl-5 space-y-2 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <li>No gaps permitted between session blocks.</li>
                      <li>Consistent weekly slot maintained.</li>
                      <li>
                        Sessions continue until client/counsellor concludes
                        therapy.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="mb-6">
                <label
                  className="block text-base font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Your Signature <span className="text-red-500">*</span>
                </label>
                <div
                  className="border-2 rounded-lg overflow-hidden"
                  style={{
                    borderColor: errors.signature
                      ? "var(--error-primary)"
                      : "var(--border-color)",
                  }}
                >
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: "w-full h-48",
                      style: { backgroundColor: "#ffffff" },
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="mt-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  Clear Signature
                </button>
                {errors.signature && (
                  <p
                    className="text-sm mt-1"
                    style={{ color: "var(--error-primary)" }}
                  >
                    {errors.signature}
                  </p>
                )}
              </div>

              {/* Signature Date (auto-generated, not editable) */}
              <div className="mb-6">
                <label
                  className="block text-base font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Date of signing
                </label>
                <p
                  className="w-full px-4 py-3 rounded-lg border text-base"
                  style={{
                    borderColor: "var(--border-color)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  {new Date(formData.signatureDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-lg text-lg font-semibold text-white transition-all"
                style={{
                  background: submitting
                    ? "var(--bg-secondary)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    Submitting Agreement...
                  </span>
                ) : (
                  "Submit Agreement"
                )}
              </button>
            </div>
          </form>

          {/* Footer Note */}
          <div className="text-center">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              By submitting this form, you agree to the terms and conditions
              outlined in the agreement.
              <br />
              Your information will be kept confidential and secure.
            </p>
          </div>
        </div>
      </div>
    </PublicFormWrapper>
  );
}

export default function MidRangeAgreementPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <Loader2 className="animate-spin h-12 w-12 text-[#6366f1]" />
        </div>
      }
    >
      <MidRangeAgreementContent />
    </Suspense>
  );
}
