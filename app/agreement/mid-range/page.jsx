"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PublicFormWrapper from "@/components/PublicFormWrapper";
import {
  FileSignature,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Download,
  ArrowRight,
  Lock,
} from "lucide-react";
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
  const [lockedFields, setLockedFields] = useState({});

  useEffect(() => {
    const email = searchParams.get("email");
    const uuid =
      searchParams.get("client_uuid") ||
      searchParams.get("uuid") ||
      searchParams.get("client_id");

    if (!email && !uuid) {
      setError(
        "This agreement link is missing required information. Please use the link provided in your email, or contact us if the problem continues.",
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

            const resolvedAddress =
              clientData.current_address ||
              (clientData.address
                ? `${clientData.address}${clientData.postcode ? `, ${clientData.postcode}` : ""}`
                : "");
            setLockedFields({
              fullLegalName: !!clientData.name,
              currentAddress: !!resolvedAddress,
              emergencyContactName: !!clientData.emergency_contact_name,
              emergencyContactPhone: !!clientData.emergency_contact_phone,
              emergencyContactRelationship:
                !!clientData.emergency_contact_relationship,
              gpName: !!clientData.gp_name,
              gpPracticeName: !!clientData.gp_practice_name,
              gpPracticePhone: !!clientData.gp_practice_phone,
            });
          } else {
            setError(
              "This agreement link is invalid or has expired. Please use the link from your original email, or contact us for a new one.",
            );
          }
        } else {
          setClientEmail(email || "");
          setClientUuid("");
        }
      } catch (err) {
        console.error("Error fetching client for agreement:", err);
        setError(
          "We couldn't verify this agreement link. Please check your connection and try again, or contact us for assistance.",
        );
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
              className="animate-spin h-8 w-8 mx-auto mb-4"
              style={{ color: "var(--accent-color)" }}
            />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Loading your agreement&hellip;
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
          <div
            className="max-w-md w-full rounded-lg border p-8"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--warning-bg)" }}
              >
                <AlertTriangle
                  className="w-5 h-5"
                  style={{ color: "var(--warning-primary)" }}
                />
              </div>
              <h2
                className="text-lg font-semibold pt-2"
                style={{ color: "var(--text-primary)" }}
              >
                Unable to Load Agreement
              </h2>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
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
          <div
            className="max-w-md w-full rounded-lg border overflow-hidden"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="p-8 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{
                  backgroundColor: "var(--success-bg)",
                  border: "1px solid var(--success-border)",
                }}
              >
                <ShieldCheck
                  className="w-6 h-6"
                  style={{ color: "var(--success-primary)" }}
                />
              </div>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Agreement Received
              </h2>
              <p
                className="text-sm mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Thank you. Your signed service agreement has been recorded.
              </p>
              <p
                className="text-xs font-mono"
                style={{ color: "var(--text-tertiary)" }}
              >
                Ref: {submittedUuid.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div
              className="p-5 space-y-2"
              style={{ borderTop: "1px solid var(--border-color)" }}
            >
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-md text-sm font-semibold text-white transition-colors bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)]"
              >
                <Download className="w-4 h-4" />
                Download PDF Copy
              </a>
              <button
                type="button"
                onClick={() =>
                  (window.location.href = `/client-booking?uuid=${submittedUuid}`)
                }
                className="flex items-center justify-center gap-2 w-full py-3 rounded-md text-sm font-semibold border transition-colors"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-primary)",
                }}
              >
                Continue to Book Your Consultation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </PublicFormWrapper>
    );
  }

  return (
    <PublicFormWrapper>
      <div className="min-h-screen" style={{ background: "var(--bg-secondary)" }}>
        <div className="h-1.5" style={{ backgroundColor: "var(--accent-color)" }} />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          {/* Document header */}
          <div
            className="mb-10 pb-8"
            style={{ borderBottom: "2px solid var(--text-primary)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FileSignature
                className="w-4 h-4"
                style={{ color: "var(--accent-color)" }}
              />
              <span
                className="text-xs font-bold tracking-[0.15em] uppercase"
                style={{ color: "var(--accent-color)" }}
              >
                Service Agreement
              </span>
            </div>
            <h1
              className="text-[26px] sm:text-3xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Vanquish Therapies
            </h1>
            <p className="text-base" style={{ color: "var(--text-secondary)" }}>
              Mid-Range Counselling &amp; Coaching Service Agreement
            </p>

            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-6 text-sm">
              <div>
                <span
                  className="block text-xs uppercase tracking-wide mb-0.5"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Client Email
                </span>
                <span
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {clientEmail || "—"}
                </span>
              </div>
              <div>
                <span
                  className="block text-xs uppercase tracking-wide mb-0.5"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Date
                </span>
                <span
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {clientUuid && (
                <div>
                  <span
                    className="block text-xs uppercase tracking-wide mb-0.5"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Reference
                  </span>
                  <span
                    className="font-mono font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {clientUuid.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Section number="01" title="Your Details">
              <Field
                label="Full Legal Name"
                required
                value={formData.fullLegalName}
                onChange={(v) => handleInputChange("fullLegalName", v)}
                error={errors.fullLegalName}
                placeholder="Enter your full legal name"
                locked={lockedFields.fullLegalName}
              />
            </Section>

            <Section
              number="02"
              title="Terms & Conditions"
              description="Please read the agreement below in full before confirming your acceptance."
            >
              <AgreementClauses variant="mid-range" />
              <label className="flex items-start gap-3 cursor-pointer mt-5">
                <input
                  type="checkbox"
                  checked={formData.termsAgreed}
                  onChange={(e) =>
                    handleInputChange("termsAgreed", e.target.checked)
                  }
                  className="mt-1 w-4 h-4 rounded shrink-0"
                  style={{ accentColor: "var(--accent-color)" }}
                />
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-primary)" }}
                >
                  I have read and agree to the terms and conditions above,
                  including the prohibition against recording any sessions.{" "}
                  <span style={{ color: "var(--warning-primary)" }}>*</span>
                </span>
              </label>
              {errors.termsAgreed && (
                <p
                  className="text-xs mt-2"
                  style={{ color: "var(--warning-primary)" }}
                >
                  {errors.termsAgreed}
                </p>
              )}
            </Section>

            <Section number="03" title="Emergency Contact">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field
                  label="Contact Name"
                  required
                  value={formData.emergencyContactName}
                  onChange={(v) => handleInputChange("emergencyContactName", v)}
                  error={errors.emergencyContactName}
                  placeholder="Full name"
                  locked={lockedFields.emergencyContactName}
                />
                <Select
                  label="Relationship to You"
                  required
                  value={formData.emergencyContactRelationship}
                  onChange={(v) =>
                    handleInputChange("emergencyContactRelationship", v)
                  }
                  error={errors.emergencyContactRelationship}
                  options={[
                    "Mother",
                    "Father",
                    "Partner",
                    "Spouse",
                    "Sibling",
                    "Friend",
                    "Guardian",
                    "Other",
                  ]}
                  locked={lockedFields.emergencyContactRelationship}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Contact Number"
                    required
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(v) =>
                      handleInputChange("emergencyContactPhone", v)
                    }
                    error={errors.emergencyContactPhone}
                    placeholder="Enter phone number"
                    locked={lockedFields.emergencyContactPhone}
                  />
                </div>
              </div>
            </Section>

            <Section number="04" title="GP Information">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field
                  label="GP Name"
                  required
                  value={formData.gpName}
                  onChange={(v) => handleInputChange("gpName", v)}
                  error={errors.gpName}
                  placeholder="Enter your GP's name"
                  locked={lockedFields.gpName}
                />
                <Field
                  label="GP Practice Name"
                  required
                  value={formData.gpPracticeName}
                  onChange={(v) => handleInputChange("gpPracticeName", v)}
                  error={errors.gpPracticeName}
                  placeholder="Enter practice name"
                  locked={lockedFields.gpPracticeName}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="GP Practice Phone"
                    required
                    type="tel"
                    value={formData.gpPracticePhone}
                    onChange={(v) => handleInputChange("gpPracticePhone", v)}
                    error={errors.gpPracticePhone}
                    placeholder="Enter practice phone number"
                    locked={lockedFields.gpPracticePhone}
                  />
                </div>
              </div>
            </Section>

            <Section number="05" title="Current Address">
              <TextArea
                label="Complete Current Address"
                required
                rows={3}
                value={formData.currentAddress}
                onChange={(v) => handleInputChange("currentAddress", v)}
                error={errors.currentAddress}
                placeholder="Include your postcode"
                locked={lockedFields.currentAddress}
              />
            </Section>

            <Section number="06" title="Ongoing Therapy Management">
              <div className="space-y-5">
                <div>
                  <h4
                    className="text-sm font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    48-hour booking rule monitoring
                  </h4>
                  <ul
                    className="list-disc pl-5 space-y-1.5 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <li>
                      Sessions must be booked 48 hours in advance &mdash; after
                      this, the booking system automatically closes the slot
                      for that week.
                    </li>
                    <li>The system will send a reminder ahead of the deadline.</li>
                  </ul>
                </div>
                <div>
                  <h4
                    className="text-sm font-semibold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Session continuity
                  </h4>
                  <ul
                    className="list-disc pl-5 space-y-1.5 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <li>No gaps are permitted between session blocks.</li>
                    <li>A consistent weekly slot is maintained throughout.</li>
                    <li>
                      Sessions continue until the client or counsellor
                      concludes therapy.
                    </li>
                  </ul>
                </div>
              </div>
            </Section>

            <Section
              number="07"
              title="Signature"
              description="Sign using your mouse, trackpad, or touchscreen below."
              last
            >
              <div
                className="rounded-md overflow-hidden border-2"
                style={{
                  borderColor: errors.signature
                    ? "var(--warning-primary)"
                    : "var(--border-color)",
                }}
              >
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: "w-full h-40",
                    style: { backgroundColor: "#ffffff" },
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border transition-colors"
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Clear Signature
                </button>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Signed on{" "}
                  {new Date(formData.signatureDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
              {errors.signature && (
                <p
                  className="text-xs mt-2"
                  style={{ color: "var(--warning-primary)" }}
                >
                  {errors.signature}
                </p>
              )}
            </Section>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-md text-base font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)]"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  Submitting Agreement&hellip;
                </span>
              ) : (
                "Sign & Submit Agreement"
              )}
            </button>
          </form>

          <p
            className="text-xs text-center mt-6 leading-relaxed"
            style={{ color: "var(--text-tertiary)" }}
          >
            By submitting this form you agree to the terms and conditions
            outlined above. Your information is kept confidential and secure.
          </p>
        </div>
      </div>
    </PublicFormWrapper>
  );
}

export default function MidRangeAgreementPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--bg-secondary, #fafbfc)" }}
        >
          <Loader2
            className="animate-spin h-8 w-8"
            style={{ color: "var(--accent-color, #6f1d56)" }}
          />
        </div>
      }
    >
      <MidRangeAgreementContent />
    </Suspense>
  );
}

// Shared presentational helpers for the agreement document layout.

function Section({ number, title, description, children, last = false }) {
  return (
    <section
      className="mb-10 pb-10"
      style={last ? undefined : { borderBottom: "1px solid var(--border-color)" }}
    >
      <div className="flex items-baseline gap-3">
        <span
          className="text-xs font-mono font-semibold"
          style={{ color: "var(--accent-color)" }}
        >
          {number}
        </span>
        <h2
          className="text-base font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
      </div>
      <div className="ml-7 mt-3">
        {description && (
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}

function FieldLabel({ label, required, locked }) {
  return (
    <label
      className="flex items-center gap-1.5 text-sm font-medium mb-1.5"
      style={{ color: "var(--text-primary)" }}
    >
      {label} {required && <span style={{ color: "var(--warning-primary)" }}>*</span>}
      {locked && (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
          style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-tertiary)" }}
        >
          <Lock className="w-2.5 h-2.5" />
          On file
        </span>
      )}
    </label>
  );
}

function Field({ label, required, value, onChange, error, type = "text", placeholder, locked = false }) {
  return (
    <div>
      <FieldLabel label={label} required={required} locked={locked} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={locked}
        className="w-full px-3.5 py-2.5 rounded-md border text-sm outline-none transition-colors focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/10"
        style={{
          borderColor: error ? "var(--warning-primary)" : "var(--border-color)",
          backgroundColor: locked ? "var(--bg-secondary)" : "var(--input-bg)",
          color: locked ? "var(--text-secondary)" : "var(--input-text)",
          cursor: locked ? "default" : "text",
        }}
      />
      {error && (
        <p className="text-xs mt-1.5" style={{ color: "var(--warning-primary)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function Select({ label, required, value, onChange, error, options, locked = false }) {
  return (
    <div>
      <FieldLabel label={label} required={required} locked={locked} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={locked}
        className="w-full px-3.5 py-2.5 rounded-md border text-sm outline-none transition-colors focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/10 disabled:cursor-default"
        style={{
          borderColor: error ? "var(--warning-primary)" : "var(--border-color)",
          backgroundColor: locked ? "var(--bg-secondary)" : "var(--input-bg)",
          color: locked ? "var(--text-secondary)" : "var(--input-text)",
        }}
      >
        <option value="">Select relationship&hellip;</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs mt-1.5" style={{ color: "var(--warning-primary)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function TextArea({ label, required, value, onChange, error, rows = 3, placeholder, locked = false }) {
  return (
    <div>
      <FieldLabel label={label} required={required} locked={locked} />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        readOnly={locked}
        className="w-full px-3.5 py-2.5 rounded-md border text-sm outline-none transition-colors resize-none focus:border-[var(--accent-color)] focus:ring-4 focus:ring-[var(--accent-color)]/10"
        style={{
          borderColor: error ? "var(--warning-primary)" : "var(--border-color)",
          backgroundColor: locked ? "var(--bg-secondary)" : "var(--input-bg)",
          color: locked ? "var(--text-secondary)" : "var(--input-text)",
          cursor: locked ? "default" : "text",
        }}
      />
      {error && (
        <p className="text-xs mt-1.5" style={{ color: "var(--warning-primary)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
