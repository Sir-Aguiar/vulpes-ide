import { IBugReportForm } from "@/@schemas/BugReport.schema";
import API from "@/services/API";
import { detectBrowser, detectOS } from "@/utils/detect-environment";

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

  const response = await API.post("/bug-report", formData);

  return response.data;
}
