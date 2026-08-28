import api from "./api";

const adminService = {
  getReportData: () => api.get("/admin/reports/data"),
  getDashboard: () => api.get("/admin/dashboard"),
  exportReport: async (format = "xlsx") => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/api/admin/reports/export?format=${format}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error("Report export failed");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(await response.blob());
    link.download = `eventsphere-report.${format === "pdf" ? "pdf" : format === "xlsx" ? "xls" : "csv"}`;
    link.click();
    URL.revokeObjectURL(link.href);
  },
};

export default adminService;