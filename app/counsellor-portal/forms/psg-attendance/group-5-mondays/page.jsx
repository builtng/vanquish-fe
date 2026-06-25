"use client";

import CounsellorJotformPage from "@/components/CounsellorJotformPage";
import { PSG_ATTENDANCE_FORMS } from "@/lib/counsellorForms";

export default function PsgGroup5MondaysFormPage() {
  return <CounsellorJotformPage form={PSG_ATTENDANCE_FORMS[0]} />;
}
