
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Attach JWT token to API requests

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// Login

export async function login(username, password) {
  const response = await api.post("/token/", {
    username,
    password,
  });

  const { access, refresh, role, username: loggedInUsername } = response.data;

  if (!access) {
    throw new Error("Login successful, but access token is missing.");
  }

  sessionStorage.setItem("access_token", access);
  sessionStorage.setItem("user_role", role);
  sessionStorage.setItem("username", loggedInUsername);

  if (refresh) {
    sessionStorage.setItem("refresh_token", refresh);
  }
  

  return response.data;
}


// Daily business report
// Business report for a selected date range
// Business report for a selected date range
export async function getDailyReport(startDate, endDate) {
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const response = await api.get("/finance/daily-report/", {
    params: {
      start_date: startDate || todayString,
      end_date: endDate || todayString,
    },
  });

  return response.data;
}

// List active services
export async function getServices() {
  const response = await api.get("/services/");
  return response.data;
}

// List customer service records
export async function getCustomerServices() {
  const response = await api.get("/customer-services/");
  return response.data;
}

// Save a customer service
export async function createCustomerService(customerData) {
  const response = await api.post(
    "/customer-services/",
    customerData
  );

  return response.data;
}

export async function getEmployees() {
  const response = await api.get("/employees/");
  return response.data;
}

export async function createEmployee(employeeData) {
  const response = await api.post("/employees/", employeeData);
  return response.data;
}

export async function getManagedServices() {
  const response = await api.get("/services/manage/");
  return response.data;
}

export async function createManagedService(serviceData) {
  const response = await api.post("/services/manage/", serviceData);
  return response.data;
}

export async function updateManagedService(serviceId, serviceData) {
  const response = await api.patch(
    `/services/manage/${serviceId}/`,
    serviceData
  );
  return response.data;
}

export async function getAttendance() {
  const response = await api.get("/finance/attendance/");
  return response.data;
}

export async function createAttendance(attendanceData) {
  const response = await api.post(
    "/finance/attendance/",
    attendanceData
  );
  return response.data;
}


export async function getSalaryPayments() {
  const response = await api.get("/finance/salary-payments/");
  return response.data;
}

export async function createSalaryPayment(paymentData) {
  const response = await api.post(
    "/finance/salary-payments/",
    paymentData
  );
  return response.data;
}


export async function getExpenses() {
  const response = await api.get("/finance/expenses/");
  return response.data;
}

export async function createExpense(expenseData) {
  const response = await api.post(
    "/finance/expenses/",
    expenseData
  );
  return response.data;
}

export async function updateExpense(expenseId, expenseData) {
  const response = await api.patch(
    `/finance/expenses/${expenseId}/`,
    expenseData
  );

  return response.data;
}

export async function deleteExpense(expenseId) {
  const response = await api.delete(
    `/finance/expenses/${expenseId}/`
  );

  return response.data;
}


export async function updateEmployee(employeeId, employeeData) {
  const response = await api.patch(
    `/employees/${employeeId}/`,
    employeeData
  );

  return response.data;
}

export async function deleteEmployee(employeeId) {
  const response = await api.delete(
    `/employees/${employeeId}/`
  );

  return response.data;
}


// Update an existing expense

export default api;
