"use client";

import CounsellorJotformPage from "@/components/CounsellorJotformPage";
import { CLINICAL_PROGRESS_FORMS } from "@/lib/counsellorForms";

export default function ClientProgressReviewFormPage() {
  return <CounsellorJotformPage form={CLINICAL_PROGRESS_FORMS[1]} />;
}
