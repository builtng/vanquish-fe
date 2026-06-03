import { BarChart2, Calendar, FileText } from "lucide-react";

export const CLINICAL_PROGRESS_FORMS = [
  {
    slug: "end-of-therapy",
    title: "End of Therapy Form",
    subtitle: "Trainee & Qualified Counsellors",
    href: "/counsellor-portal/forms/end-of-therapy",
    jotformUrl: "https://form.jotform.com/242455166711051",
    icon: FileText,
    accent: "#6f1d56",
    description: "Complete this form when a client's therapy journey concludes.",
  },
  {
    slug: "client-progress-review",
    title: "Client Progress Review",
    subtitle: "Trainee Counsellors",
    href: "/counsellor-portal/forms/client-progress-review",
    jotformUrl: "https://form.jotform.com/240292614707051",
    icon: BarChart2,
    accent: "#3b82f6",
    description: "Periodic review to document client progress and therapeutic outcomes.",
  },
];

export const PSG_ATTENDANCE_FORMS = [
  {
    slug: "group-5-mondays",
    title: "PSG Attendance - Group 5",
    subtitle: "Mondays",
    groupName: "Group 5",
    dayOfWeek: "Monday",
    href: "/counsellor-portal/forms/psg-attendance/group-5-mondays",
    jotformUrl: "https://form.jotform.com/252162390922454",
    icon: Calendar,
    accent: "#6366f1",
    description: "Log attendance for Group 5 Monday peer support sessions.",
  },
  {
    slug: "group-4-thursdays",
    title: "PSG Attendance - Group 4",
    subtitle: "Thursdays",
    groupName: "Group 4",
    dayOfWeek: "Thursday",
    href: "/counsellor-portal/forms/psg-attendance/group-4-thursdays",
    jotformUrl: "https://form.jotform.com/250412125203438",
    icon: Calendar,
    accent: "#f97316",
    description: "Log attendance for Group 4 Thursday peer support sessions.",
  },
  {
    slug: "group-3-wednesdays",
    title: "PSG Attendance - Group 3",
    subtitle: "Wednesdays",
    groupName: "Group 3",
    dayOfWeek: "Wednesday",
    href: "/counsellor-portal/forms/psg-attendance/group-3-wednesdays",
    jotformUrl: "https://form.jotform.com/241365224856459",
    icon: Calendar,
    accent: "#10b981",
    description: "Log attendance for Group 3 Wednesday peer support sessions.",
  },
];

export const COUNSELLOR_FORMS = [
  ...CLINICAL_PROGRESS_FORMS,
  ...PSG_ATTENDANCE_FORMS,
];

export function getPsgAttendanceFormForGroup(attendanceGroup) {
  if (!attendanceGroup) return null;

  const groupName = attendanceGroup.name?.toLowerCase() || "";
  const dayOfWeek = attendanceGroup.day_of_week?.toLowerCase() || "";

  return PSG_ATTENDANCE_FORMS.find((form) => {
    return (
      groupName.includes(form.groupName.toLowerCase()) ||
      dayOfWeek === form.dayOfWeek.toLowerCase()
    );
  }) || null;
}
