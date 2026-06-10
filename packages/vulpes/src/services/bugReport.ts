import {
  IBugReportForm,
  IUpdateBugReportDTO,
} from "@/@schemas/BugReport.schema";
import { IBugReport } from "@/@types/BugReport";
import API from "@/services/API";
import { detectBrowser, detectOS } from "@/utils/detect-environment";

export async function getBugReports() {
  const response = await API.get<IBugReport[]>("/bug-report");
  return response.data;
}

export async function getBugReportById(id: number) {
  const response = await API.get<IBugReport>(`/bug-report/${id}`);
  return response.data;
}

export async function updateBugReport(id: number, data: IUpdateBugReportDTO) {
  const response = await API.patch<IBugReport>(`/bug-report/${id}`, data);
  return response.data;
}

export async function submitBugReport(data: IBugReportForm) {
  const formData = new FormData();

  formData.append("path", data.path);
  formData.append("description", data.description);
  formData.append("os", detectOS());
  formData.append("browser", detectBrowser());

  if (data.expectedBehavior) {
    formData.append("expectedBehavior", data.expectedBehavior);
  }
  if (data.actualBehavior) {
    formData.append("actualBehavior", data.actualBehavior);
  }
  if (data.stepsToReproduce) {
    formData.append("stepsToReproduce", data.stepsToReproduce);
  }

  for (const file of data.screenshots ?? []) {
    formData.append("screenshots", file);
  }

  await API.post("/bug-report", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
