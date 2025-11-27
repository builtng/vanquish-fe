"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  Shield,
  GraduationCap,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Save,
} from "lucide-react";
import apiService from "@/lib/api";

export default function QualifiedCounsellorForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tcId = searchParams.get("tc_id") || searchParams.get("id");

  const [formData, setFormData] = useState({
    // Personal Information
    legalFirstName: "",
    legalLastName: "",
    registeredAddress: "",
    registeredCity: "",
    registeredPostcode: "",
    hasSupervisor: "",

    // Experience
    previousVanquishWork: "",
    areasToImprove: "",
    uniqueTrait: "",
    counsellorTrainingDetails: "",
    qualifiedToWorkWith: [],
    challengingCases: "",

    // Documents
    qualificationDocument: null,
    dbsCertificateQualified: null,
    insuranceQualified: null,
    selfEmploymentProof: null,
    professionalMembership: null,

    // Signature
    signature: "",
    signatureDate: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const qualifiedToWorkWithOptions = ["Individuals", "Couples", "Families"];

  // Fetch and prefill form data from database
  useEffect(() => {
    const fetchAndPrefillData = async () => {
      if (!tcId) return;

      try {
        setIsLoading(true);
        // Use getTrainingCounsellorDetails for more complete data
        const data = await apiService.getTrainingCounsellorDetails(tcId);
        
        // Prefill form with existing data from database
        if (data) {
          setFormData((prev) => ({
            ...prev,
            // Personal Information
            legalFirstName: data.legal_first_name || prev.legalFirstName,
            legalLastName: data.legal_last_name || prev.legalLastName,
            registeredAddress: data.registered_address || prev.registeredAddress,
            registeredCity: data.registered_city || prev.registeredCity,
            registeredPostcode: data.registered_postcode || prev.registeredPostcode,
            hasSupervisor: data.has_supervisor || prev.hasSupervisor,
            
            // Experience
            previousVanquishWork: data.previous_vanquish_work || prev.previousVanquishWork,
            areasToImprove: data.areas_to_improve || prev.areasToImprove,
            uniqueTrait: data.unique_trait || prev.uniqueTrait,
            counsellorTrainingDetails: data.counsellor_training_details || prev.counsellorTrainingDetails,
            qualifiedToWorkWith: Array.isArray(data.qualified_to_work_with) 
              ? data.qualified_to_work_with 
              : prev.qualifiedToWorkWith,
            challengingCases: data.challenging_cases || prev.challengingCases,
            
            // Signature
            signature: data.signature || prev.signature,
            signatureDate: data.signature_date 
              ? new Date(data.signature_date).toISOString().split('T')[0]
              : prev.signatureDate,
          }));
        }
      } catch (error) {
        console.error("Error fetching training counsellor data:", error);
        // Don't show error to user, just silently fail - form will remain empty
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndPrefillData();
  }, [tcId]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else if (name === "qualifiedToWorkWith") {
      const checked = e.target.checked;
      setFormData((prev) => {
        const current = prev.qualifiedToWorkWith || [];
        if (checked) {
          return {
            ...prev,
            qualifiedToWorkWith: [...current, value],
          };
        } else {
          return {
            ...prev,
            qualifiedToWorkWith: current.filter((item) => item !== value),
          };
        }
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Information
    if (!formData.legalFirstName.trim())
      newErrors.legalFirstName = "First name is required";
    if (!formData.legalLastName.trim())
      newErrors.legalLastName = "Last name is required";
    if (!formData.registeredAddress.trim())
      newErrors.registeredAddress = "Address is required";
    if (!formData.registeredCity.trim())
      newErrors.registeredCity = "City/Town is required";
    if (!formData.registeredPostcode.trim())
      newErrors.registeredPostcode = "Postal code is required";
    if (!formData.hasSupervisor)
      newErrors.hasSupervisor = "Please select supervisor status";

    // Experience
    if (!formData.areasToImprove.trim())
      newErrors.areasToImprove = "This field is required";
    if (!formData.uniqueTrait.trim())
      newErrors.uniqueTrait = "This field is required";
    if (!formData.counsellorTrainingDetails.trim())
      newErrors.counsellorTrainingDetails = "This field is required";
    if (formData.qualifiedToWorkWith.length === 0)
      newErrors.qualifiedToWorkWith = "Please select at least one option";
    if (!formData.challengingCases.trim())
      newErrors.challengingCases = "This field is required";

    // Documents
    if (!formData.qualificationDocument)
      newErrors.qualificationDocument = "Qualification document is required";
    if (!formData.dbsCertificateQualified)
      newErrors.dbsCertificateQualified = "DBS certificate is required";
    if (!formData.insuranceQualified)
      newErrors.insuranceQualified = "Insurance document is required";
    if (!formData.selfEmploymentProof)
      newErrors.selfEmploymentProof = "Self employment proof is required";
    if (!formData.professionalMembership)
      newErrors.professionalMembership = "Professional membership is required";

    // Signature
    if (!formData.signature.trim())
      newErrors.signature = "Signature is required";
    if (!formData.signatureDate)
      newErrors.signatureDate = "Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFile = async (file, fieldName) => {
    if (!file) return null;

    const formDataToUpload = new FormData();
    formDataToUpload.append("file", file);
    formDataToUpload.append("field", fieldName);
    formDataToUpload.append("tc_id", tcId);

    try {
      setUploadProgress((prev) => ({ ...prev, [fieldName]: 50 }));
      const response = await apiService.request("/qualified-counsellor/upload-document", {
        method: "POST",
        body: formDataToUpload,
        headers: {}, // Let browser set Content-Type for FormData
      });
      setUploadProgress((prev) => ({ ...prev, [fieldName]: 100 }));
      return response.data.file_path;
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      setUploadProgress((prev) => ({ ...prev, [fieldName]: 0 }));
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload all documents first
      const [
        qualificationDoc,
        dbsDoc,
        insuranceDoc,
        selfEmploymentDoc,
        membershipDoc,
      ] = await Promise.all([
        uploadFile(formData.qualificationDocument, "qualification"),
        uploadFile(formData.dbsCertificateQualified, "dbs"),
        uploadFile(formData.insuranceQualified, "insurance"),
        uploadFile(formData.selfEmploymentProof, "self_employment"),
        uploadFile(formData.professionalMembership, "membership"),
      ]);

      // Submit form data
      const submitData = {
        tc_id: tcId,
        legal_first_name: formData.legalFirstName,
        legal_last_name: formData.legalLastName,
        registered_address: formData.registeredAddress,
        registered_city: formData.registeredCity,
        registered_postcode: formData.registeredPostcode,
        has_supervisor: formData.hasSupervisor,
        previous_vanquish_work: formData.previousVanquishWork,
        areas_to_improve: formData.areasToImprove,
        unique_trait: formData.uniqueTrait,
        counsellor_training_details: formData.counsellorTrainingDetails,
        qualified_to_work_with: formData.qualifiedToWorkWith,
        challenging_cases: formData.challengingCases,
        qualification_document: qualificationDoc,
        dbs_certificate_qualified: dbsDoc,
        insurance_qualified: insuranceDoc,
        self_employment_proof: selfEmploymentDoc,
        professional_membership: membershipDoc,
        signature: formData.signature,
        signature_date: formData.signatureDate,
      };

      await apiService.request("/qualified-counsellor/submit", {
        method: "POST",
        body: JSON.stringify(submitData),
      });

      alert("Qualified Counsellor form submitted successfully!");
      router.push("/dashboard/training-counsellors");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tcId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Missing TC ID
          </h2>
          <p className="text-gray-600 mb-4">
            Please access this form from the dashboard.
          </p>
          <button
            onClick={() => router.push("/dashboard/training-counsellors")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Qualified Counsellor Application
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Please complete all required fields to transition to Qualified
                Counsellor status
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Please be advised:</strong> All required fields on the
              form must be completed. Failure to do so will result in an error
              message. Therefore, it is crucial that you carefully review the
              form and provide accurate and complete information to avoid any
              submission issues.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Legal Name (As per your ID) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="legalFirstName"
                      value={formData.legalFirstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                        errors.legalFirstName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="First Name"
                    />
                    {errors.legalFirstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.legalFirstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="legalLastName"
                      value={formData.legalLastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                        errors.legalLastName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Last Name"
                    />
                    {errors.legalLastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.legalLastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Registered Address (As per your ID) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="registeredAddress"
                    value={formData.registeredAddress}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                      errors.registeredAddress
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Address"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="registeredCity"
                      value={formData.registeredCity}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                        errors.registeredCity
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="City/Town"
                    />
                    <input
                      type="text"
                      name="registeredPostcode"
                      value={formData.registeredPostcode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                        errors.registeredPostcode
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Postal Code"
                    />
                  </div>
                </div>
                {(errors.registeredAddress ||
                  errors.registeredCity ||
                  errors.registeredPostcode) && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.registeredAddress ||
                      errors.registeredCity ||
                      errors.registeredPostcode}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you currently have a Supervisor? <span className="text-red-500">*</span>
                </label>
                <select
                  name="hasSupervisor"
                  value={formData.hasSupervisor}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                    errors.hasSupervisor ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Please Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.hasSupervisor && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.hasSupervisor}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Experience
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have you previously worked with Vanquish Therapies? If so,
                  please specify your role and capacity.
                </label>
                <textarea
                  name="previousVanquishWork"
                  value={formData.previousVanquishWork}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                  placeholder="Please provide details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  If you have previously completed a placement with Vanquish
                  Therapies, in a paragraph, please explain what areas do you
                  feel you would need to improve or develop to transition into
                  a role as a Qualified Counsellor within the Practice? Please
                  state how would you work on these improvements.{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="areasToImprove"
                  value={formData.areasToImprove}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                    errors.areasToImprove
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Please provide details..."
                />
                {errors.areasToImprove && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.areasToImprove}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  In a paragraph, tell us something unique or quirky about
                  yourself that you appreciate - something others may not be
                  familiar with. Why do you feel this trait or interest is
                  important to you? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="uniqueTrait"
                  value={formData.uniqueTrait}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                    errors.uniqueTrait ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Please provide details..."
                />
                {errors.uniqueTrait && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.uniqueTrait}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please mention all Counsellor related training, education, and
                  theoretical approaches, and the areas you specialise in. (e.g.
                  depression, anxiety, abuse, etc) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="counsellorTrainingDetails"
                  value={formData.counsellorTrainingDetails}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                    errors.counsellorTrainingDetails
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Please provide details..."
                />
                {errors.counsellorTrainingDetails && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.counsellorTrainingDetails}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which of the following are you qualified to work with?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {qualifiedToWorkWithOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name="qualifiedToWorkWith"
                        value={option}
                        checked={formData.qualifiedToWorkWith.includes(option)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                      />
                      <span className="text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.qualifiedToWorkWith && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.qualifiedToWorkWith}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Are there any client cases you might find particularly
                  challenging, or prefer not to work with at this moment?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="challengingCases"
                  value={formData.challengingCases}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                    errors.challengingCases
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Please provide details..."
                />
                {errors.challengingCases && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.challengingCases}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documents
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Please ensure you upload below: Your Qualification, Recent DBS
              Certificate, Copy of Insurance as a qualified counsellor, Proof
              of Self Employment, Copy of your professional membership.
            </p>

            <div className="space-y-4">
              {[
                {
                  name: "qualificationDocument",
                  label: "Qualification Document",
                  error: errors.qualificationDocument,
                },
                {
                  name: "dbsCertificateQualified",
                  label: "Recent DBS Certificate",
                  error: errors.dbsCertificateQualified,
                },
                {
                  name: "insuranceQualified",
                  label: "Insurance as a Qualified Counsellor",
                  error: errors.insuranceQualified,
                },
                {
                  name: "selfEmploymentProof",
                  label: "Proof of Self Employment",
                  error: errors.selfEmploymentProof,
                },
                {
                  name: "professionalMembership",
                  label: "Professional Membership",
                  error: errors.professionalMembership,
                },
              ].map((doc) => (
                <div key={doc.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {doc.label} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      name={doc.name}
                      onChange={handleInputChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                        doc.error ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {formData[doc.name] && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {uploadProgress[doc.name] && (
                      <span className="text-sm text-gray-600">
                        {uploadProgress[doc.name]}%
                      </span>
                    )}
                  </div>
                  {doc.error && (
                    <p className="text-red-500 text-xs mt-1">{doc.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Signature Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Disclaimer
            </h2>
            <p className="text-sm text-gray-700 mb-4">
              I certify that the information provided above is true and of
              accurate record.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="signature"
                  value={formData.signature}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                    errors.signature ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Type your full name"
                />
                {errors.signature && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.signature}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="signatureDate"
                  value={formData.signatureDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 ${
                    errors.signatureDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.signatureDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.signatureDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                After signing the form and clicking on submit, please scroll
                back up to review all information before submitting. Thank you
                for completing the application form.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#6f1d56" }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Submit Form
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

