import { useEffect, useState } from "react";
import {
  Scissors,
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarCheck,
  Wallet,
  ReceiptText,
  ChartNoAxesCombined,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Clock3,
  MoreHorizontal,
  CircleDollarSign,
  UserRound,
  CheckCircle2,
  Menu,
  X,
  LogOut,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  getDailyReport,
  login,
  getServices,
  getCustomerServices,
  createCustomerService,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getManagedServices,
  createManagedService,
  updateManagedService,
  getAttendance,
  createAttendance,
  getSalaryPayments,
  createSalaryPayment,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "./api";

import "./App.css";

// const adminNavigation = [
//   { name: "Dashboard", icon: LayoutDashboard },
//   { name: "Employees", icon: Users },
//   { name: "Customer Services", icon: ClipboardList },
//   { name: "Services & Pricing", icon: Scissors },
//   { name: "Attendance", icon: CalendarCheck },
//   { name: "Salary Payments", icon: Wallet },
//   { name: "Expenses", icon: ReceiptText },
//   { name: "Reports", icon: ChartNoAxesCombined },
// ];

// const employeeNavigation = [
//   { name: "Dashboard", icon: LayoutDashboard },
//   { name: "Customer Services", icon: ClipboardList },
// ];

// const navigation =
//   userRole === "ADMIN" ? adminNavigation : employeeNavigation;



// Demo-only chart data. Historical data is not yet connected to Django.
const revenueData = [
  { day: "Mon", revenue: 4200 },
  { day: "Tue", revenue: 5800 },
  { day: "Wed", revenue: 4600 },
  { day: "Thu", revenue: 7200 },
  { day: "Fri", revenue: 6100 },
  { day: "Sat", revenue: 9400 },
  { day: "Sun", revenue: 7800 },
];

// Demo-only expense chart segments. The displayed totals use Django API data.
const expenseData = [
  { name: "Shop supplies", value: 450, color: "#c9a45e" },
  { name: "Electricity", value: 300, color: "#8c9b86" },
  { name: "Rent", value: 1000, color: "#a4a0ba" },
  { name: "Other", value: 250, color: "#e0d8c8" },
];

// Demo-only customer rows. The Customer Services page below uses real API data.
const recentServices = [
  {
    id: 1,
    name: "Arun Kumar",
    initials: "AK",
    service: "Haircut",
    employee: "Kannan",
    time: "10:30 AM",
    amount: 150,
  },
  {
    id: 2,
    name: "Vijay Kumar",
    initials: "VK",
    service: "Haircut + Beard",
    employee: "Raja",
    time: "11:15 AM",
    amount: 250,
  },
  {
    id: 3,
    name: "Suresh",
    initials: "S",
    service: "Beard Trim",
    employee: "Kannan",
    time: "12:05 PM",
    amount: 80,
  },
  {
    id: 4,
    name: "Praveen",
    initials: "P",
    service: "Haircut",
    employee: "Raja",
    time: "12:40 PM",
    amount: 150,
  },
];

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

function CustomerServicesPage({ onSaved }) {
  const [services, setServices] = useState([]);
  const [records, setRecords] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      setError("");
      setLoadingRecords(true);

      const [serviceData, recordData] = await Promise.all([
        getServices(),
        getCustomerServices(),
      ]);

      const serviceList = Array.isArray(serviceData)
        ? serviceData
        : serviceData.results ?? [];
      const recordList = Array.isArray(recordData)
        ? recordData
        : recordData.results ?? [];

      setServices(serviceList);
      setRecords(recordList);
      setServiceId((current) => current || String(serviceList[0]?.id ?? ""));
    } catch (err) {
      console.error("Customer services error:", err);
      setError(
        err.response?.status === 401
          ? "Login expired. Please sign in again and reload this page."
          : err.response?.status === 403
          ? "You do not have permission to view these records."
          : "Unable to load services. Check the API and Django server."
      );
    } finally {
      setLoadingRecords(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!serviceId) {
      setError("No active service found. Add a service in Django Admin first.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await createCustomerService({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        service: Number(serviceId),
      });

      setCustomerName("");
      setCustomerPhone("");
      setMessage("Customer service saved successfully!");
      await loadData();
      await onSaved?.();
    } catch (err) {
      console.error("Save customer service error:", err);
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Unable to save. Check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <section className="hero-row">
        <div>
          <div className="eyebrow">
            <span />
            CUSTOMER MANAGEMENT
          </div>
          <h1>Customer Services</h1>
          <p className="hero-subtitle">Record customer visits and services.</p>
        </div>
      </section>

      <section className="panel" style={{ padding: "24px" }}>
        <div className="section-kicker">NEW ENTRY</div>
        <h3>Record a customer service</h3>

        <form
  className="customer-service-form"
  onSubmit={handleSubmit}
  style={{
    display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <label>
            Customer name
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
              maxLength={100}
              placeholder="Enter customer name"
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                marginTop: "6px",
              }}
            />
          </label>

          <label>
            Phone number
            <input
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              maxLength={15}
              placeholder="Enter phone number"
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                marginTop: "6px",
              }}
            />
          </label>

          <label>
            Select service
            <select
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                marginTop: "6px",
              }}
            >
              <option value="">Choose a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} — {formatMoney(service.price)}
                </option>
              ))}
            </select>
          </label>

          <div style={{ alignSelf: "end" }}>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Saving..." : "Save Customer Service"}
            </button>
          </div>
        </form>

        {error && (
          <p role="alert" style={{ color: "#b42318", overflowWrap: "anywhere" }}>
            {error}
          </p>
        )}
        {message && (
          <p role="status" style={{ color: "#247747" }}>
            {message}
          </p>
        )}

        <p style={{ color: "#777", fontSize: "13px" }}>
          The amount is taken from the selected service price. No employee
          commission is calculated.
        </p>
      </section>

      <section className="panel" style={{ padding: "24px" }}>
        <div className="section-kicker">DATABASE RECORDS</div>
        <h3>Saved customer services</h3>

        <div className="table-scroll" style={{ marginTop: "16px" }}>
          <table className="services-table customer-service-table">
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>SERVICE</th>
                <th>EMPLOYEE</th>
                <th className="right">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.customer_name}</td>
                  <td>{record.service_name}</td>
                  <td>{record.employee_name}</td>
                  <td className="right">
                    <strong>{formatMoney(record.amount)}</strong>
                  </td>
                </tr>
              ))}
              {!loadingRecords && records.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-row">
                    No customer services found.
                  </td>
                </tr>
              )}
              {loadingRecords && (
                <tr>
                  <td colSpan="4" className="empty-row">
                    Loading customer records...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [nativePlace, setNativePlace] = useState("");
  const [experience, setExperience] = useState("FRESHER");
  const [dailySalary, setDailySalary] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  async function loadEmployees() {
    try {
      setError("");

      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error("Employees API error:", err);
      setError(
        err.response?.status === 401
          ? "Login expired. Please sign in again."
          : err.response?.status === 403
          ? "Only an authorised admin can manage employees."
          : "Unable to load employees. Check the Django API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  
async function handleSubmit(event) {
  event.preventDefault();

  try {
    setSaving(true);
    setError("");
    setMessage("");

    const employeeData = {
      name: name.trim(),
      phone: phone.trim(),
      native_place: nativePlace.trim(),
      experience_level: experience,
      daily_salary: dailySalary,
      is_active: true,
    };

    if (editingId !== null) {
      await updateEmployee(editingId, employeeData);
      setMessage("Employee updated successfully!");
    } else {
      await createEmployee({
        ...employeeData,
        username: username.trim(),
        password,
      });
      setMessage("Employee created successfully!");
    }

    resetEmployeeForm();
    await loadEmployees();
  } catch (err) {
    console.error("Save employee error:", err);

    setError(
      err.response?.data
        ? JSON.stringify(err.response.data)
        : "Unable to save employee. Check the Django server."
    );
  } finally {
    setSaving(false);
  }
}

function resetEmployeeForm() {
  setName("");
  setUsername("");
  setPassword("");
  setPhone("");
  setNativePlace("");
  setExperience("FRESHER");
  setDailySalary("");
  setEditingId(null);
}

function handleEdit(employee) {
  setEditingId(employee.id);
  setName(employee.name || "");
  setUsername(
    employee.account_username || employee.username || ""
  );
  setPassword("");
  setPhone(employee.phone || "");
  setNativePlace(employee.native_place || "");
  setExperience(employee.experience_level || "FRESHER");
  setDailySalary(String(employee.daily_salary ?? ""));
  setError("");
  setMessage("");
}

async function handleDelete(employee) {
  const confirmed = window.confirm(
    `Delete employee "${employee.name}"?`
  );

  if (!confirmed) return;

  try {
    setError("");
    setMessage("");

    await deleteEmployee(employee.id);

    if (editingId === employee.id) {
      resetEmployeeForm();
    }

    setMessage("Employee profile deleted successfully!");
    await loadEmployees();
  } catch (err) {
    console.error("Delete employee error:", err);
    setError(
      err.response?.data
        ? JSON.stringify(err.response.data)
        : "Unable to delete employee."
    );
  }
}


  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <section className="hero-row">
        <div>
          <div className="eyebrow">
            <span />
            TEAM MANAGEMENT
          </div>
          <h1>Employees</h1>
          <p className="hero-subtitle">
            Manage employee details and daily salaries.
          </p>
        </div>
      </section>

      <section className="panel" style={{ padding: "24px" }}>
        <div className="section-kicker">NEW EMPLOYEE</div>
        <h3>{editingId !== null ? "Edit employee" : "Add an employee"}</h3>

        <form
  className="employee-form"
  onSubmit={handleSubmit}
  style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <label>
            Full name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              placeholder="Employee name"
              style={{ display: "block", width: "100%", padding: "12px", marginTop: "6px", boxSizing: "border-box" }}
            />
          </label>

          <label>
            Login username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="off"
              placeholder="Unique username"
              style={{ display: "block", width: "100%", padding: "12px", marginTop: "6px", boxSizing: "border-box" }}
            />
          </label>
          
{editingId === null && (
  <label>
    Temporary password
    <input
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      minLength={8}
      autoComplete="new-password"
      placeholder="Minimum 8 characters"
      style={{
        display: "block",
        width: "100%",
        padding: "12px",
        marginTop: "6px",
        boxSizing: "border-box",
      }}
    />
  </label>
)}

          <label>
            Temporary password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              style={{ display: "block", width: "100%", padding: "12px", marginTop: "6px", boxSizing: "border-box" }}
            />
          </label>

          <label>
            Phone number
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              maxLength={15}
              placeholder="Phone number"
              style={{ display: "block", width: "100%", padding: "12px", marginTop: "6px", boxSizing: "border-box" }}
            />
          </label>

          <label>
            Native place
            <input
              value={nativePlace}
              onChange={(e) => setNativePlace(e.target.value)}
              placeholder="Native place (optional)"
              style={{ display: "block", width: "100%", padding: "12px", marginTop: "6px", boxSizing: "border-box" }}
            />
          </label>

          <label>
            Experience
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              style={{ display: "block", width: "100%", padding: "12px", marginTop: "6px", boxSizing: "border-box" }}
            >
              <option value="FRESHER">Fresher</option>
              <option value="EXPERIENCED">Experienced</option>
            </select>
          </label>

          <label>
            Daily salary (₹)
            <input
              type="number"
              value={dailySalary}
              onChange={(e) => setDailySalary(e.target.value)}
              required
              min="0.01"
              step="0.01"
              placeholder="Example: 700"
              style={{ display: "block", width: "100%", padding: "12px", marginTop: "6px", boxSizing: "border-box" }}
            />
          </label>

          
<div style={{ display: "flex", gap: "10px", alignSelf: "end" }}>
  <button
    type="submit"
    className="primary-button"
    disabled={saving}
  >
    {saving
      ? "Saving..."
      : editingId !== null
      ? "Update Employee"
      : "Add Employee"}
  </button>

  {editingId !== null && (
    <button
      type="button"
      className="secondary-button"
      onClick={resetEmployeeForm}
      disabled={saving}
    >
      Cancel
    </button>
  )}
</div>

        </form>

        {error && (
          <p role="alert" style={{ color: "#b42318", overflowWrap: "anywhere" }}>
            {error}
          </p>
        )}

        {message && (
          <p role="status" style={{ color: "#247747" }}>
            {message}
          </p>
        )}

        <p style={{ color: "#777", fontSize: "13px" }}>
          Salary is a daily wage. No service commission is included.
        </p>
      </section>

      <section className="panel" style={{ padding: "24px" }}>
        <div className="section-kicker">TEAM DIRECTORY</div>
        <h3>Employee list</h3>

        {loading ? (
          <p>Loading employees...</p>
        ) : (
          <div className="table-scroll" style={{ marginTop: "16px" }}>
            <table className="services-table emplyoee-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>USERNAME</th>
                  <th>PHONE</th>
                  <th>EXPERIENCE</th>
                  <th className="right">DAILY SALARY</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
  <div className="employee-name-cell">
    <span className="employee-avatar">
      {(employee.name || "?").trim().charAt(0).toUpperCase()}
    </span>
    <strong>{employee.name}</strong>
  </div>
</td>
                    <td>{employee.account_username || employee.username}</td>
                    <td>{employee.phone}</td>
                    <td>
  <span
    className={`employee-experience ${
      employee.experience_level === "EXPERIENCED"
        ? "experienced"
        : "fresher"
    }`}
  >
    {employee.experience_level === "EXPERIENCED"
      ? "Experienced"
      : "Fresher"}
  </span>
</td>

<td className="right">
  <span className="employee-salary">
    {formatMoney(employee.daily_salary)}/day
  </span>
</td>

<td>
  <div style={{ display: "flex", gap: "8px" }}>
    <button
      type="button"
      className="secondary-button"
      onClick={() => handleEdit(employee)}
    >
      Edit
    </button>

    <button
      type="button"
      className="secondary-button"
      onClick={() => handleDelete(employee)}
    >
      Delete
    </button>
  </div>
</td>

                  </tr>
                ))}

                {employees.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-row">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function ServicesPricingPage() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadServices() {
    try {
      setError("");

      const data = await getManagedServices();
      setServices(Array.isArray(data) ? data : data.results ?? []);
    } catch (err) {
      console.error("Services API error:", err);
      setError(
        err.response?.status === 401
          ? "Please sign in again."
          : err.response?.status === 403
          ? "Only an authorised admin can manage services."
          : "Unable to load services. Check the Django server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  function startEdit(service) {
    setEditingId(service.id);
    setName(service.name);
    setPrice(String(service.price));
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setPrice("");
    setError("");
    setMessage("");
  }

  
async function handleSubmit(event) {
  event.preventDefault();

  try {
    setSaving(true);
    setError("");
    setMessage("");

    const employeeData = {
      name: name.trim(),
      phone: phone.trim(),
      native_place: nativePlace.trim(),
      experience_level: experience,
      daily_salary: dailySalary,
      is_active: true,
    };

    if (editingId !== null) {
      await updateEmployee(editingId, employeeData);
      setMessage("Employee updated successfully!");
    } else {
      await createEmployee({
        ...employeeData,
        username: username.trim(),
        password,
      });
      setMessage("Employee created successfully!");
    }

    resetEmployeeForm();
    await loadEmployees();
  } catch (err) {
    console.error("Save employee error:", err);

    setError(
      err.response?.data
        ? JSON.stringify(err.response.data)
        : "Unable to save employee. Check the Django server."
    );
  } finally {
    setSaving(false);
  }
}

function resetEmployeeForm() {
  setName("");
  setUsername("");
  setPassword("");
  setPhone("");
  setNativePlace("");
  setExperience("FRESHER");
  setDailySalary("");
  setEditingId(null);
}

function handleEdit(employee) {
  setEditingId(employee.id);
  setName(employee.name || "");
  setUsername(
    employee.account_username || employee.username || ""
  );
  setPassword("");
  setPhone(employee.phone || "");
  setNativePlace(employee.native_place || "");
  setExperience(employee.experience_level || "FRESHER");
  setDailySalary(String(employee.daily_salary ?? ""));
  setError("");
  setMessage("");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function handleDelete(employee) {
  const confirmed = window.confirm(
    `Delete employee "${employee.name}"? This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    setError("");
    setMessage("");

    await deleteEmployee(employee.id);

    if (editingId === employee.id) {
      resetEmployeeForm();
    }

    setMessage("Employee profile deleted successfully!");
    await loadEmployees();
  } catch (err) {
    console.error("Delete employee error:", err);

    setError(
      err.response?.data
        ? JSON.stringify(err.response.data)
        : "Unable to delete employee."
    );
  }
}


  async function toggleActive(service) {
    try {
      setError("");
      setMessage("");

      await updateManagedService(service.id, {
        is_active: !service.is_active,
      });

      setMessage(
        `${service.name} ${service.is_active ? "deactivated" : "activated"} successfully.`
      );

      await loadServices();
    } catch (err) {
      console.error("Update service status error:", err);
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Unable to update service status."
      );
    }
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <section className="hero-row">
        <div>
          <div className="eyebrow">
            <span />
            SERVICE MANAGEMENT
          </div>
          <h1>Services &amp; Pricing</h1>
          <p className="hero-subtitle">
            Manage salon services and their prices.
          </p>
        </div>
      </section>

      <section className="panel" style={{ padding: "24px" }}>
        <div className="section-kicker">
          {editingId !== null ? "EDIT SERVICE" : "NEW SERVICE"}
        </div>
        <h3>
          {editingId !== null ? "Update service details" : "Add a service"}
        </h3>

        <form
          className="customer-service-form"
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <label>
            Service name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              placeholder="Example: Haircut"
            />
          </label>

          <label>
            Price (₹)
            <input
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              min="0.01"
              step="0.01"
              placeholder="Example: 150"
            />
          </label>

          <div style={{ display: "flex", alignItems: "end", gap: "10px" }}>
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId !== null
                ? "Update Service"
                : "Add Service"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="subtle-button"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {error && (
          <p role="alert" style={{ color: "#b42318", overflowWrap: "anywhere" }}>
            {error}
          </p>
        )}

        {message && (
          <p role="status" style={{ color: "#247747" }}>
            {message}
          </p>
        )}
      </section>

      <section className="panel" style={{ padding: "24px" }}>
        <div className="section-kicker">PRICE LIST</div>
        <h3>All services</h3>

        {loading ? (
          <p>Loading services...</p>
        ) : (
          <div className="table-scroll" style={{ marginTop: "16px" }}>
            <table className="services-table pricing-table">
              <thead>
                <tr>
                  <th>SERVICE</th>
                  <th>PRICE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <strong>{service.name}</strong>
                    </td>
                    <td>{formatMoney(service.price)}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "5px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: service.is_active ? "#247747" : "#777",
                          background: service.is_active ? "#e7f5eb" : "#eeeeee",
                        }}
                      >
                        {service.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="subtle-button"
                          onClick={() => startEdit(service)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="subtle-button"
                          onClick={() => toggleActive(service)}
                        >
                          {service.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {services.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-row">
                      No services found. Add your first service above.
                    </td>   
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState("PRESENT");
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      setError("");

      const [employeeData, attendanceData] = await Promise.all([
        getEmployees(),
        getAttendance(),
      ]);

      const employeeList = Array.isArray(employeeData)
        ? employeeData
        : employeeData.results ?? [];

      const attendanceList = Array.isArray(attendanceData)
        ? attendanceData
        : attendanceData.results ?? [];

      setEmployees(employeeList);
      setRecords(attendanceList);

      setEmployeeId((current) => {
        if (current && employeeList.some(
          (employee) => String(employee.user_id) === current
        )) {
          return current;
        }

        return String(employeeList[0]?.user_id ?? "");
      });
    } catch (err) {
      console.error("Attendance API error:", err);
      setError(
        err.response?.status === 401
          ? "Login expired. Please sign in again."
          : err.response?.status === 403
          ? "Only an authorised admin can manage attendance."
          : "Unable to load attendance. Check the Django API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!employeeId) {
      setError("Please add an employee before marking attendance.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await createAttendance({
  employee: Number(employeeId),
  date: attendanceDate,
  status,
});

      setMessage("Attendance saved successfully!");
      await loadData();
    } catch (err) {
      console.error("Save attendance error:", err);

      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Unable to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <section className="hero-row">
        <div>
          <div className="eyebrow">
            <span />
            TEAM MANAGEMENT
          </div>
          <h1>Attendance</h1>
          <p className="hero-subtitle">
            Track employee attendance and daily presence.
          </p>
        </div>
      </section>

      <section className="panel" style={{ padding: "24px" }}>
        <div className="section-kicker">DAILY ATTENDANCE</div>
        <h3>Mark attendance</h3>

        <form
  className="employee-form attendance-form"
  onSubmit={handleSubmit}
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginTop: "20px",
  }}
>
          <label>
            Employee
            <select
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              required
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.user_id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Attendance date
            <input
              type="date"
              value={attendanceDate}
              onChange={(event) => setAttendanceDate(event.target.value)}
              required
            />
          </label>

          <label>
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
            </select>
          </label>

          <div style={{ alignSelf: "end" }}>
            <button
              type="submit"
              className="primary-button"
              disabled={saving || loading}
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </form>

        {error && (
          <p role="alert" style={{ color: "#b42318", overflowWrap: "anywhere" }}>
            {error}
          </p>
        )}

        {message && (
          <p role="status" style={{ color: "#247747" }}>
            {message}
          </p>
        )}

        <p style={{ color: "#777", fontSize: "13px" }}>
          One attendance record per employee per date.
        </p>
      </section>

      <section className="panel" style={{ padding: "24px" }}>
        <div className="section-kicker">ATTENDANCE REGISTER</div>
        <h3>Saved attendance</h3>

        {loading ? (
          <p>Loading attendance...</p>
        ) : (
          
<div
  className="table-scroll attendance-table-wrap"
  style={{ marginTop: "16px" }}
>
  <table className="services-table attendance-table">

              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              

<tbody>
  {records.map((record) => {
    const employee = employees.find(
      (item) =>
        Number(item.user_id) === Number(record.employee)
    );

    const employeeName =
      record.employee_name ||
      employee?.name ||
      record.employee_username ||
      `Employee #${record.employee}`;

    const formattedDate = record.date
      ? new Date(`${record.date}T00:00:00`).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )
      : "Date not available";

    const statusClass =
      record.status === "PRESENT"
        ? "status-present"
        : record.status === "ABSENT"
        ? "status-absent"
        : "status-half-day";

    const statusLabel = {
      PRESENT: "Present",
      ABSENT: "Absent",
      HALF_DAY: "Half Day",
    };

    return (
      <tr key={record.id}>
        <td>
          <div className="attendance-employee">
            <span className="attendance-avatar">
              {employeeName.charAt(0).toUpperCase()}
            </span>
            <strong>{employeeName}</strong>
          </div>
        </td>

        <td className="attendance-date">
          {formattedDate}
        </td>

        <td>
          <span className={`attendance-status ${statusClass}`}>
            <span className="status-dot" />
            {statusLabel[record.status] ?? record.status}
          </span>
        </td>
      </tr>
    );
  })}

  {records.length === 0 && (
    <tr>
      <td colSpan="3" className="empty-row">
        No attendance records found.
      </td>
    </tr>
  )}
</tbody>


            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SalaryPaymentsPage() {
  const [employees, setEmployees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
  });
  const [daysPaid, setDaysPaid] = useState("1");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      setError("");

      const [employeeData, paymentData] = await Promise.all([
        getEmployees(),
        getSalaryPayments(),
      ]);

      const employeeList = Array.isArray(employeeData)
        ? employeeData
        : employeeData.results ?? [];

      const paymentList = Array.isArray(paymentData)
        ? paymentData
        : paymentData.results ?? [];

      setEmployees(employeeList);
      setPayments(paymentList);

      setEmployeeId((current) => {
        if (
          current &&
          employeeList.some(
            (employee) => String(employee.id) === current
          )
        ) {
          return current;
        }

        return String(employeeList[0]?.id ?? "");
      });
    } catch (err) {
      console.error("Salary payments API error:", err);

      setError(
        err.response?.status === 401
          ? "Login expired. Please sign in again."
          : err.response?.status === 403
          ? "Only an authorised admin can manage salary payments."
          : "Unable to load salary payments. Check the Django API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedEmployee = employees.find(
    (employee) => String(employee.id) === employeeId
  );

  const previewAmount =
    Number(selectedEmployee?.daily_salary ?? 0) *
    Number(daysPaid || 0);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!employeeId) {
      setError("Please select an employee.");
      return;
    }

    if (!Number.isFinite(Number(daysPaid)) || Number(daysPaid) <= 0) {
      setError("Paid days must be greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await createSalaryPayment({
        employee: Number(employeeId),
        payment_date: paymentDate,
        days_paid: Number(daysPaid),
        notes: notes.trim(),
      });

      setMessage("Salary payment recorded successfully!");
      setDaysPaid("1");
      setNotes("");

      await loadData();
    } catch (err) {
      console.error("Create salary payment error:", err);

      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Unable to record salary payment."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="salary-payments-page">
      <section className="hero-row">
        <div>
          <div className="eyebrow">
            <span />
            PAYROLL MANAGEMENT
          </div>
          <h1>Salary Payments</h1>
          <p className="hero-subtitle">
            Record daily wages and review payment history.
          </p>
        </div>
      </section>

      <section className="panel" style={{ padding: "24px", width: "100%", boxSizing: "border-box" }}>
        <div className="section-kicker">NEW PAYMENT</div>
        <h3>Record employee salary</h3>

        <form
          className="employee-form salary-payment-form"
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "18px",
            marginTop: "20px",
          }}
        >
          <label>
            Employee
            <select
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              required
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} — {formatMoney(employee.daily_salary)}/day
                </option>
              ))}
            </select>
          </label>

          <label>
            Payment date
            <input
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
              required
            />
          </label>

          <label>
            Days paid
            <input
              type="number"
              value={daysPaid}
              onChange={(event) => setDaysPaid(event.target.value)}
              min="0.01"
              max="31"
              step="0.5"
              required
            />
          </label>

          <label>
            Notes (optional)
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={255}
              placeholder="Example: Daily wage payment"
            />
          </label>

          <div className="salary-preview">
            <span>Estimated payment</span>
            <strong>{formatMoney(previewAmount)}</strong>
            <small>Calculated from employee daily salary</small>
          </div>

          <div style={{ display: "flex", alignItems: "end" }}>
            <button
              type="submit"
              className="primary-button"
              disabled={saving || loading || !employeeId}
            >
              {saving ? "Saving..." : "Record Salary Payment"}
            </button>
          </div>
        </form>

        {error && (
          <p role="alert" style={{ color: "#b42318", overflowWrap: "anywhere" }}>
            {error}
          </p>
        )}

        {message && (
          <p role="status" style={{ color: "#247747" }}>
            {message}
          </p>
        )}

        <p style={{ color: "#777", fontSize: "13px" }}>
          Daily wage only. No service commission is included.
        </p>
      </section>

      <section className="panel" style={{ padding: "24px", width: "100%", boxSizing: "border-box" }}>
        <div className="section-kicker">PAYROLL HISTORY</div>
        <h3>Saved salary payments</h3>

        {loading ? (
          <p>Loading salary payments...</p>
        ) : (
          <div className="table-scroll" style={{ marginTop: "16px" }}>
            <table className="services-table salary-payment-table">
              <thead>
                <tr>
                  <th>EMPLOYEE</th>
                  <th>PAYMENT DATE</th>
                  <th>DAYS PAID</th>
                  <th>DAILY SALARY</th>
                  <th>AMOUNT PAID</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <strong>
                        {payment.employee_name || `Employee #${payment.employee}`}
                      </strong>
                    </td>
                    <td>{payment.payment_date}</td>
                    <td>{payment.days_paid}</td>
                    <td>{formatMoney(payment.daily_salary)}</td>
                    <td>
                      <span className="employee-salary">
                        {formatMoney(payment.amount_paid)}
                      </span>
                    </td>
                  </tr>
                ))}

                {payments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      No salary payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


function ExpensesPage({ onSaved }) {
  const [expenses, setExpenses] = useState([]);
  const [expenseType, setExpenseType] = useState("BUSINESS");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(() => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
  });
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  async function loadExpenses() {
    try {
      setError("");

      const data = await getExpenses();
      const list = Array.isArray(data) ? data : data.results ?? [];

      setExpenses(list);
    } catch (err) {
      console.error("Expenses API error:", err);

      setError(
        err.response?.status === 401
          ? "Login expired. Please sign in again."
          : err.response?.status === 403
          ? "Only an authorised admin can manage expenses."
          : "Unable to load expenses. Check the Django API."
      );
    } finally {
      setLoading(false);
    }
  }
  function handleEdit(expense) {
  if (expense.is_voided) return;

  setEditingExpenseId(expense.id);
  setExpenseType(expense.expense_type);
  setTitle(expense.title || "");
  setAmount(String(expense.amount ?? ""));
  setExpenseDate(String(expense.expense_date || "").slice(0, 10));
  setDescription(expense.description || "");

  setError("");
  setMessage("");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEdit() {
  setEditingExpenseId(null);
  setExpenseType("BUSINESS");
  setTitle("");
  setAmount("");
  setDescription("");
  setError("");
  setMessage("");
}

async function handleDelete(expense) {
  const confirmed = window.confirm(
    `Cancel expense "${expense.title}"? This record will remain in the register as Cancelled.`
  );

  if (!confirmed) return;

  try {
    setError("");
    setMessage("");

    await deleteExpense(expense.id);

    if (editingExpenseId === expense.id) {
      cancelEdit();
    }

    await loadExpenses();
    await onSaved?.();

    setMessage("Expense cancelled successfully!");
  } catch (err) {
    console.error("Delete expense error:", err);

    setError(
      err.response?.status === 403
        ? "Only an authorised admin can manage expenses."
        : err.response?.data
        ? JSON.stringify(err.response.data)
        : "Unable to cancel expense. Check the Django API."
    );
  }
}

  useEffect(() => {
  console.log("✅ ExpensesPage mounted");
  loadExpenses();
}, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const amountValue = Number(amount);

    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
  expense_type: expenseType,
  title: title.trim(),
  amount: amountValue.toFixed(2),
  expense_date: expenseDate,
  description: description.trim(),
};

if (editingExpenseId !== null) {
  await updateExpense(editingExpenseId, payload);
  setMessage("Expense updated successfully!");
} else {
  await createExpense(payload);
  setMessage("Expense saved successfully!");
}

setEditingExpenseId(null);
setTitle("");
setAmount("");
setDescription("");

await loadExpenses();
await onSaved?.();
    } catch (err) {
      console.error("Create expense error:", err);

      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Unable to save expense. Check the Django API."
      );
    } finally {
      setSaving(false);
    }
  }

  const activeExpenses = expenses.filter(
    (expense) => !expense.is_voided
  );

  const businessTotal = activeExpenses
    .filter((expense) => expense.expense_type === "BUSINESS")
    .reduce((total, expense) => total + Number(expense.amount), 0);

  const personalTotal = activeExpenses
    .filter((expense) => expense.expense_type === "PERSONAL")
    .reduce((total, expense) => total + Number(expense.amount), 0);

  return (
    <div className="expenses-page">
      <section className="hero-row">
        <div>
          <div className="eyebrow">
            <span />
            EXPENSE MANAGEMENT
          </div>
          <h1>Expenses</h1>
          <p className="hero-subtitle">
            Track shop expenses separately from personal spending.
          </p>
        </div>
      </section>

      <section className="panel expense-panel-full">
        <div className="section-kicker">NEW EXPENSE</div>
        <h3>Record an expense</h3>

        <form
          className="expense-form"
          onSubmit={handleSubmit}
        >
          <label>
            Expense type
            <select
              value={expenseType}
              onChange={(event) => setExpenseType(event.target.value)}
              required
            >
              <option value="BUSINESS">Business Expense</option>
              <option value="PERSONAL">Admin Personal Expense</option>
            </select>
          </label>

          <label>
            Expense title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: Shop rent"
              maxLength={150}
              required
            />
          </label>

          <label>
            Amount (₹)
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Example: 1500"
              min="0.01"
              step="0.01"
              required
            />
          </label>

          <label>
            Expense date
            <input
              type="date"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
              required
            />
          </label>

          <label className="expense-description">
            Description (optional)
            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add additional details"
            />
          </label>

          <div className="expense-submit">
  <button
    type="submit"
    className="primary-button"
    disabled={saving || loading}
  >
    {saving
      ? editingExpenseId !== null
        ? "Updating..."
        : "Saving..."
      : editingExpenseId !== null
      ? "Update Expense"
      : "Save Expense"}
  </button>

  {editingExpenseId !== null && (
    <button
      type="button"
      className="expense-cancel-edit"
      onClick={cancelEdit}
      disabled={saving}
    >
      Cancel Edit
    </button>
  )}
</div>
        </form>

        {error && (
          <p role="alert" className="expense-error">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="expense-success">
            {message}
          </p>
        )}
      </section>

      <section className="expense-summary-grid">
        <article className="expense-summary">
          <span>Business Expenses</span>
          <strong>{formatMoney(businessTotal)}</strong>
          <small>Active business expense entries</small>
        </article>

        <article className="expense-summary">
          <span>Admin Personal Expenses</span>
          <strong>{formatMoney(personalTotal)}</strong>
          <small>Active personal expense entries</small>
        </article>
      </section>

      <section className="panel expense-panel-full">
  <div className="section-kicker">EXPENSE REGISTER</div>
  <h3>Saved expenses</h3>

  {loading ? (
    <p>Loading expenses...</p>
  ) : (
    <div className="table-scroll" style={{ marginTop: "16px" }}>
      <table className="services-table expense-table">
        <thead>
          <tr>
            <th>TYPE</th>
            <th>EXPENSE</th>
            <th>DATE</th>
            <th>RECORDED BY</th>
            <th className="right">AMOUNT</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>
                <span
                  className={`expense-type-badge ${
                    expense.expense_type === "BUSINESS"
                      ? "business-expense-badge"
                      : "personal-expense-badge"
                  }`}
                >
                  {expense.expense_type === "BUSINESS"
                    ? "Business"
                    : "Personal"}
                </span>
              </td>

              <td>
                <strong>{expense.title}</strong>

                {expense.description && (
                  <small className="expense-row-description">
                    {expense.description}
                  </small>
                )}
              </td>

              <td>{expense.expense_date}</td>

              <td>{expense.created_by_username || "Admin"}</td>

              <td className="right">
                <strong>{formatMoney(expense.amount)}</strong>
              </td>

              <td>
                <span
                  className={`expense-status ${
                    expense.is_voided
                      ? "expense-voided"
                      : "expense-active"
                  }`}
                >
                  {expense.is_voided ? "Cancelled" : "Active"}
                </span>
              </td>

              <td>
                {!expense.is_voided ? (
                  <div className="expense-row-actions">
                    <button
                      type="button"
                      className="expense-action-btn expense-edit-btn"
                      onClick={() => handleEdit(expense)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="expense-action-btn expense-delete-btn"
                      onClick={() => handleDelete(expense)}
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <span className="expense-action-muted">
                    Cancelled
                  </span>
                )}
              </td>
            </tr>
          ))}

          {expenses.length === 0 && (
            <tr>
              <td colSpan={7} className="empty-row">
                No expenses recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}
</section>
    </div>
  );
}


function ReportsPage() {
  const getLocalDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${today.getFullYear()}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState(getLocalDate);
  const [endDate, setEndDate] = useState(getLocalDate);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadReport(event) {
    event?.preventDefault();

    if (startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getDailyReport(startDate, endDate);
      setReport(data);
    } catch (err) {
      console.error("Reports API error:", err);

      setError(
        err.response?.status === 401
          ? "Login expired. Please sign in again."
          : err.response?.status === 403
          ? "Only an authorised admin can view reports."
          : err.response?.data?.error ||
            "Unable to load report. Check the Django server."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []); 

  const dailyRows = report?.daily_breakdown ?? [];

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <section className="hero-row">
        <div>
          <div className="eyebrow">
            <span />
            FINANCIAL REPORTS
          </div>
          <h1>Business Reports</h1>
          <p className="hero-subtitle">
            View collections, expenses and salary payments for any date range.
          </p>
        </div>
      </section>

      <section className="panel" style={{ padding: "24px" }}>
        <div className="section-kicker">REPORT FILTER</div>
        <h3>Select date range</h3>

        <form
          onSubmit={loadReport}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "20px",
            alignItems: "end",
          }}
        >
          <label>
            Start date
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginTop: "6px",
                boxSizing: "border-box",
              }}
            />
          </label>

          <label>
            End date
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(event) => setEndDate(event.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginTop: "6px",
                boxSizing: "border-box",
              }}
            />
          </label>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Loading..." : "Generate Report"}
          </button>
        </form>

        {error && (
          <p role="alert" style={{ color: "#b42318", marginTop: "16px" }}>
            {error}
          </p>
        )}
      </section>

      <section className="stats-grid">
        <StatCard
          title="Total Collection"
          amount={report?.total_service_collection}
          loading={loading}
          note="Selected period"
          icon={CircleDollarSign}
          tone="gold"
        />
        <StatCard
          title="Business Expenses"
          amount={report?.business_expenses}
          loading={loading}
          note="Selected period"
          icon={ReceiptText}
          tone="rose"
          direction="down"
        />
        <StatCard
          title="Salary Paid"
          amount={report?.salary_paid}
          loading={loading}
          note="Selected period"
          icon={Wallet}
          tone="blue"
        />
        <StatCard
          title="Net Business Balance"
          amount={report?.net_business_balance}
          loading={loading}
          note="Collection minus business expenses and salaries"
          icon={ChartNoAxesCombined}
          tone="green"
        />
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <div className="stat-card-head">
            <span>Admin Personal Expenses</span>
            <div className="stat-icon rose">
              <ReceiptText size={19} />
            </div>
          </div>
          <h2>
            {loading
              ? "Loading..."
              : formatMoney(report?.admin_personal_expenses)}
          </h2>
          <div className="stat-card-foot">
            <span className="muted">Tracked separately from business balance</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-card-head">
            <span>Total Business Outflow</span>
            <div className="stat-icon blue">
              <Wallet size={19} />
            </div>
          </div>
          <h2>
            {loading
              ? "Loading..."
              : formatMoney(report?.total_business_outflow)}
          </h2>
          <div className="stat-card-foot">
            <span className="muted">Business expenses + salary paid</span>
          </div>
        </article>
      </section>

      <section className="panel" style={{ padding: "24px" }}>
        <div className="panel-heading">
          <div>
            <div className="section-kicker">DAILY PERFORMANCE</div>
            <h3>Collection and expenses</h3>
            <p>
              {startDate} to {endDate}
            </p>
          </div>
        </div>

        <div style={{ width: "100%", height: "320px", marginTop: "20px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dailyRows}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="reportGoldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c6a15a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c6a15a" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#efeee8"
                strokeDasharray="4 5"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{ fill: "#99998f", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{ fill: "#99998f", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                formatter={(value, name) => [
                  formatMoney(value),
                  name === "service_collection"
                    ? "Collection"
                    : name === "business_expenses"
                    ? "Business expenses"
                    : "Salary paid",
                ]}
              />

              <Area
                type="monotone"
                dataKey="service_collection"
                name="service_collection"
                stroke="#b28d49"
                strokeWidth={3}
                fill="url(#reportGoldFill)"
              />

              <Area
                type="monotone"
                dataKey="business_expenses"
                name="business_expenses"
                stroke="#b86c6c"
                fill="#b86c6c"
                fillOpacity={0.08}
              />

              <Area
                type="monotone"
                dataKey="salary_paid"
                name="salary_paid"
                stroke="#8295b0"
                fill="#8295b0"
                fillOpacity={0.08}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {!loading && report && dailyRows.length === 0 && (
          <p className="muted">
            No daily breakdown returned for this period.
          </p>
        )}
      </section>

      <section className="panel" style={{ padding: "24px" }}>
        <div className="section-kicker">DAILY REGISTER</div>
        <h3>Day-by-day breakdown</h3>

        <div className="table-scroll" style={{ marginTop: "16px" }}>
          <table className="services-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th className="right">COLLECTION</th>
                <th className="right">BUSINESS EXPENSES</th>
                <th className="right">SALARY PAID</th>
                <th className="right">NET BALANCE</th>
              </tr>
            </thead>

            <tbody>
              {dailyRows.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td className="right">
                    {formatMoney(row.service_collection)}
                  </td>
                  <td className="right">
                    {formatMoney(row.business_expenses)}
                  </td>
                  <td className="right">
                    {formatMoney(row.salary_paid)}
                  </td>
                  <td className="right">
                    <strong>{formatMoney(row.net_business_balance)}</strong>
                  </td>
                </tr>
              ))}

              {!loading && dailyRows.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No report rows available. Select a date range and generate
                    the report.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  amount,
  loading,
  icon: Icon,
  tone,
  direction = "up",
  note,
}) {
  return (
    <article className="stat-card">
      <div className="stat-card-head">
        <span>{title}</span>
        <div className={`stat-icon ${tone}`}>
          <Icon size={19} />
        </div>
      </div>
      <h2>
        {loading ? (
          <span className="muted">Loading...</span>
        ) : amount === null || amount === undefined ? (
          "—"
        ) : (
          formatMoney(amount)
        )}
      </h2>
      <div className="stat-card-foot">
        <span className={`trend ${direction === "up" ? "positive" : "negative"}`}>
          {direction === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {loading ? "Please wait" : note}
        </span>
        <span className="muted">Daily report</span>
      </div>
      <div className={`card-accent ${tone}`} />
    </article>
  );
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [period, setPeriod] = useState("week");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(sessionStorage.getItem("access_token"))
  );
  const [userRole, setUserRole] = useState(
  () => sessionStorage.getItem("user_role") || ""
);

const [loggedInUsername, setLoggedInUsername] = useState(
  () => sessionStorage.getItem("username") || ""
);

const [accountMenuOpen, setAccountMenuOpen] = useState(false);



const adminNavigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Employees", icon: Users },
  { name: "Customer Services", icon: ClipboardList },
  { name: "Services & Pricing", icon: Scissors },
  { name: "Attendance", icon: CalendarCheck },
  { name: "Salary Payments", icon: Wallet },
  { name: "Expenses", icon: ReceiptText },
  { name: "Reports", icon: ChartNoAxesCombined },
];

const employeeNavigation = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Customer Services", icon: ClipboardList },
];

const navigation =
  userRole?.toUpperCase() === "ADMIN"
    ? adminNavigation
    : employeeNavigation;



  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [recentServices, setRecentServices] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);


function handleLogout() {
  // Clear login session
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user_role");
  sessionStorage.removeItem("username");

  // Reset React state
  setIsAuthenticated(false);
  setUserRole("");
  setLoggedInUsername("");
  setUsername("");
  setPassword("");
  setLoginError("");
  setActivePage("Dashboard");
  setAccountMenuOpen(false);
}


async function handleLogin(event) {
  event.preventDefault();

  try {
    setLoginLoading(true);
    setLoginError("");

    const userData = await login(username, password);

    setUserRole(
      userData?.role || sessionStorage.getItem("user_role") || ""
    );

    setLoggedInUsername(
      userData?.username || sessionStorage.getItem("username") || username
    );

    setIsAuthenticated(true);
    setPassword("");
  } catch (error) {
    console.error("Login error:", error);

    setLoginError(
      error.response?.status === 401
        ? "Invalid username or password."
        : "Login failed. Check the Django server and API settings."
    );
  } finally {
    setLoginLoading(false);
  }
}


  
  async function loadReport() {
    try {
      setLoading(true);
      setServicesLoading(true);
      setApiError("");

      // Today's date in local YYYY-MM-DD format
      const today = new Date();

      const toDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const endDate = toDateString(today);
      const start = new Date(today);

      if (period === "week") {
        start.setDate(start.getDate() - 6);
      } else {
        start.setDate(1);
      }

      const startDate = toDateString(start);

      // Fetch real data from Django APIs
      const [todayReport, periodReport, customerData] =
        await Promise.all([
          getDailyReport(endDate, endDate),
          getDailyReport(startDate, endDate),
          getCustomerServices(),
        ]);

      // Today's dashboard summary
      setReport(todayReport);

      // Real daily collection data for the chart
      const dailyRows = periodReport?.daily_breakdown ?? [];

      setRevenueData(
        dailyRows.map((row) => ({
          day: new Date(
            `${row.date}T00:00:00`
          ).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
          }),
          revenue: Number(row.service_collection ?? 0),
        }))
      );

      // Real expense amounts for the donut chart
      setExpenseData([
        {
          name: "Business expenses",
          value: Number(todayReport?.business_expenses ?? 0),
          color: "#c9a45e",
        },
        {
          name: "Admin personal expenses",
          value: Number(
            todayReport?.admin_personal_expenses ?? 0
          ),
          color: "#a4a0ba",
        },
      ]);

      // Handle either a list or paginated DRF response
      const records = Array.isArray(customerData)
        ? customerData
        : customerData?.results ?? [];

      // Convert API records into the fields used by the existing UI
      const recentRows = records
        .map((record) => {
          const name = record.customer_name || "Unknown customer";

          const initials = name
            .trim()
            .split(/\s+/)
            .map((word) => word[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return {
            id: record.id,
            name,
            initials: initials || "?",
            service: record.service_name || "Service",
            employee: record.employee_name || "—",
            time: record.service_date
              ? new Date(record.service_date).toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : "—",
            amount: Number(record.amount ?? 0),
            serviceDate: record.service_date,
          };
        })
        .sort(
          (a, b) =>
            new Date(b.serviceDate || 0) -
            new Date(a.serviceDate || 0)
        )
        .slice(0, 6);

      setRecentServices(recentRows);
    } catch (error) {
      console.error("Dashboard API error:", error);

      if (error.response?.status === 401) {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        setIsAuthenticated(false);
        setApiError("Your login has expired. Please sign in again.");
      } else if (error.response?.status === 403) {
        setApiError(
          "Access denied. Check your account permissions."
        );
      } else {
        setApiError(
          "Unable to load dashboard data. Check the Django server and API."
        );
      }
    } finally {
      setLoading(false);
      setServicesLoading(false);
    }
  }


  useEffect(() => {
    if (isAuthenticated) {
      loadReport();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated,period]);

  const filteredServices = recentServices.filter((row) =>
    `${row.name} ${row.service} ${row.employee}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalExpenses =
    Number(report?.business_expenses ?? 0) +
    Number(report?.admin_personal_expenses ?? 0);

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#171611",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            width: "100%",
            maxWidth: "380px",
            padding: "32px",
            borderRadius: "16px",
            background: "#fff",
            display: "grid",
            gap: "16px",
          }}
        >
          <h2 style={{ margin: 0, color: "#9b7838" }}>KANNAN SALOON</h2>
          <p style={{ margin: 0, color: "#666" }}>
            Sign in to your management dashboard
          </p>
          <label>
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginTop: "6px",
                boxSizing: "border-box",
              }}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginTop: "6px",
                boxSizing: "border-box",
              }}
            />
          </label>
          {loginError && (
            <p role="alert" style={{ color: "#b42318", margin: 0 }}>
              {loginError}
            </p>
          )}
          <button
            type="submit"
            disabled={loginLoading}
            style={{
              padding: "13px",
              background: "#b99550",
              color: "#171611",
              border: 0,
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loginLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="mobile-overlay"
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-emblem">
            <Scissors size={25} />
          </div>
          <div>
            <div className="brand-name">KANNAN</div>
            <div className="brand-subtitle">GENTLEMEN'S SALOON</div>
          </div>
          <button
            className="close-menu"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-caption">WORKSPACE</div>
        <nav className="sidebar-nav">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-link ${activePage === name ? "nav-active" : ""}`}
              onClick={() => {
                setActivePage(name);
                setMobileMenu(false);
              }}
            >
              <Icon size={18} strokeWidth={1.7} />
              <span>{name}</span>
              {name === "Customer Services" && <span className="nav-count">+</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="shop-status">
            <span className="online-dot" />
            <div>
              <strong>Shop is active</strong>
              <small>Ready for business</small>
            </div>
          </div>
          <div className="sidebar-footer">
            <div className="footer-monogram">K</div>
            <div>
              <strong>Kannan Saloon</strong>
              <small>Management Portal</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setMobileMenu(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumbs">
              <span>Workspace</span>
              <b>/</b>
              {activePage}
            </div>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customers..."
                aria-label="Search customers"
              />
              {search && (
                <button onClick={() => setSearch("")} aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
            </label>
            <button className="notification-btn" aria-label="Notifications">
              <Bell size={19} />
              <span />
            </button>
            <div className="top-divider" />
            
<div style={{ position: "relative" }}>
  <button
    type="button"
    onClick={() => setAccountMenuOpen((open) => !open)}
    aria-expanded={accountMenuOpen}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      textAlign: "left",
      color: "inherit",
      padding: "4px",
    }}
  >
    <div className="profile-avatar">
      {(loggedInUsername || "U").charAt(0).toUpperCase()}
    </div>

    <div className="profile-copy">
      <strong>{loggedInUsername || "User"}</strong>
      <small>
        {userRole?.toUpperCase() === "ADMIN"
          ? "Administrator"
          : "Employee"}
      </small>
    </div>

    <ChevronDown size={15} className="profile-chevron" />
  </button>

  {accountMenuOpen && (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 10px)",
        right: 0,
        width: "190px",
        padding: "8px",
        background: "#ffffff",
        border: "1px solid #e8e5dd",
        borderRadius: "10px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        zIndex: 1000,
      }}
    >
      <button
        type="button"
        onClick={handleLogout}
        style={{
          width: "100%",
          padding: "11px",
          border: "none",
          borderRadius: "6px",
          background: "transparent",
          textAlign: "left",
          cursor: "pointer",
          color: "#29271f",
        }}
      >
        <UserRound size={16} style={{ verticalAlign: "middle", marginRight: "8px" }} />
        Switch Account
      </button>

      <button
        type="button"
        onClick={handleLogout}
        style={{
          width: "100%",
          padding: "11px",
          border: "none",
          borderRadius: "6px",
          background: "transparent",
          textAlign: "left",
          cursor: "pointer",
          color: "#b42318",
        }}
      >
        <LogOut size={16} style={{ verticalAlign: "middle", marginRight: "8px" }} />
        Logout
      </button>
    </div>
  )}
</div>
          </div> {/* Close topbar-actions */}
        </header>

        <div className="page-content">
          {activePage === "Dashboard" ? (
            <>
              <section className="hero-row">
                <div>
                  <div className="eyebrow">
                    <span />
                    YOUR BUSINESS AT A GLANCE
                  </div>
                  <h1>
                    Good afternoon, <em>Admin.</em>
                  </h1>
                  <p className="hero-subtitle">
                    Here's what's happening at your saloon today.
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setActivePage("Customer Services")}
                >
                  <Plus size={17} />
                  Record a Service
                </button>
              </section>

              {apiError && (
                <div
                  role="alert"
                  style={{
                    padding: "14px 16px",
                    marginBottom: "20px",
                    borderRadius: "10px",
                    border: "1px solid #e7b8b8",
                    background: "#fff4f4",
                    color: "#9b2929",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>{apiError}</span>
                  <button className="subtle-button" onClick={loadReport} disabled={loading}>
                    <RefreshCw size={15} />
                    Retry
                  </button>
                </div>
              )}

              <section className="stats-grid">
                <StatCard
                  title="Today's Collection"
                  amount={report?.total_service_collection}
                  loading={loading}
                  note="From Django API"
                  icon={CircleDollarSign}
                  tone="gold"
                />
                <StatCard
                  title="Business Expenses"
                  amount={report?.business_expenses}
                  loading={loading}
                  note="From Django API"
                  icon={ReceiptText}
                  tone="rose"
                  direction="down"
                />
                <StatCard
                  title="Salary Paid"
                  amount={report?.salary_paid}
                  loading={loading}
                  note="From Django API"
                  icon={Wallet}
                  tone="blue"
                />
                <StatCard
                  title="Net Business Balance"
                  amount={report?.net_business_balance}
                  loading={loading}
                  note="From Django API"
                  icon={ChartNoAxesCombined}
                  tone="green"
                />
              </section>

              <section className="analytics-grid">
                <article className="panel revenue-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">FINANCIAL PERFORMANCE</div>
                      <h3>Revenue overview</h3>
                      <p>Daily collection from the report API</p>
                    </div>
                    <select
                      value={period}
                      onChange={(event) => setPeriod(event.target.value)}
                      aria-label="Revenue period"
                    >
                      <option value="week">This week</option>
                      <option value="month">This month</option>
                    </select>
                  </div>

                  <div className="revenue-total">
                    <strong>
                      {loading
                        ? "Loading..."
                        : report
                        ? formatMoney(report.total_service_collection)
                        : "—"}
                    </strong>
                    <span>
                      <ArrowUpRight size={15} />
                      Today's collection
                    </span>
                  </div>

                  <div className="revenue-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={revenueData}
                        margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c6a15a" stopOpacity={0.28} />
                            <stop offset="95%" stopColor="#c6a15a" stopOpacity={0.015} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#efeee8" strokeDasharray="4 5" vertical={false} />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#99998f", fontSize: 11 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#99998f", fontSize: 10 }}
                          tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip
                          formatter={(value) => [
  formatMoney(value),
  "Collection",
]}
                          contentStyle={{ borderRadius: 10, border: "1px solid #eee7d9", fontSize: 12 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#b28d49"
                          strokeWidth={3}
                          fill="url(#goldFill)"
                          activeDot={{ r: 5, fill: "#b28d49", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-foot">
  <span>
    <i className="legend-dot" />
    Actual daily collection
  </span>
  <span>
    {period === "week" ? "Last 7 days" : "This month"}
  </span>
</div>
                </article>

                <article className="panel expense-panel">
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">COST BREAKDOWN</div>
                      <h3>Expense overview</h3>
                      <p>Business and personal expenses</p>
                    </div>
                    <button className="icon-plain" aria-label="Expense options">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  <div className="expense-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="63%"
                          outerRadius="88%"
                          paddingAngle={4}
                          stroke="none"
                        >
                          {expenseData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatMoney(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="donut-center">
                      <strong>
                        {loading ? "..." : report ? formatMoney(totalExpenses) : "—"}
                      </strong>
                      <span>API expenses total</span>
                    </div>
                  </div>

                  <div className="expense-legend">
                    <div className="legend-row">
                      <span className="legend-name">
                        <i style={{ background: "#c9a45e" }} />Business expenses
                      </span>
                      <strong>
                        {loading ? "..." : report ? formatMoney(report.business_expenses) : "—"}
                      </strong>
                    </div>
                    <div className="legend-row">
                      <span className="legend-name">
                        <i style={{ background: "#a4a0ba" }} />Admin personal expenses
                      </span>
                      <strong>
                        {loading ? "..." : report ? formatMoney(report.admin_personal_expenses) : "—"}
                      </strong>
                    </div>
                  </div>
                  <p className="sample-note">
  Business and personal expense totals from your database.
</p>
                </article>
              </section>

              <section className="panel services-panel">
                <div className="panel-heading services-heading">
                  <div>
                    <div className="section-kicker">BUSINESS ACTIVITY</div>
                    <h3>Recent customer services</h3>
                    <p>Latest customer records from your database</p>
                  </div>
                  <button className="subtle-button" onClick={() => setActivePage("Customer Services")}>
                    View all <ArrowUpRight size={15} />
                  </button>
                </div>

                <div className="table-scroll">
                  <table className="services-table">
                    <thead>
                      <tr>
                        <th>CUSTOMER</th>
                        <th>SERVICE</th>
                        <th>EMPLOYEE</th>
                        <th>TIME</th>
                        <th className="right">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <div className="customer-cell">
                              <span className="customer-avatar">{row.initials}</span>
                              <strong>{row.name}</strong>
                            </div>
                          </td>
                          <td><span className="service-pill">{row.service}</span></td>
                          <td>
                            <span className="employee-cell">
                              <UserRound size={14} />
                              {row.employee}
                            </span>
                          </td>
                          <td>
                            <span className="time-cell">
                              <Clock3 size={13} />
                              {row.time}
                            </span>
                          </td>
                          <td className="right">
                            <strong className="money-cell">{formatMoney(row.amount)}</strong>
                          </td>
                        </tr>
                      ))}
                      {filteredServices.length === 0 && (
                        <tr>
                          <td colSpan="5" className="empty-row">No matching customer services found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="table-bottom">
  <span>
    <CheckCircle2 size={14} />
    Database connected
  </span>
  <span>
    {servicesLoading
      ? "Loading records..."
      : `${recentServices.length} recent records`}
  </span>
</div>
              </section>

              <footer className="page-footer">
                <span>© 2026 Kannan Saloon Management</span>
                <span><span className="online-dot" />Business overview</span>
              </footer>
            </>
          ) : activePage === "Customer Services" ? (
  <CustomerServicesPage onSaved={loadReport} />

) : activePage === "Employees" ? (
  <EmployeesPage />
) : activePage === "Services & Pricing" ? (
  <ServicesPricingPage />

) : activePage === "Attendance" ? (
  <AttendancePage />


) : activePage === "Salary Payments" ? (
  <SalaryPaymentsPage />
) : activePage === "Expenses" ? (
  <ExpensesPage onSaved={loadReport} />
) : activePage === "Reports" ? (
  <ReportsPage />
) : (
  <section className="coming-soon">




              <div className="coming-icon"><Scissors size={28} /></div>
              <div className="section-kicker">KANNAN SALOON MANAGEMENT</div>
              <h1>{activePage}</h1>
              <p>This module will be connected to your Django backend in the next step.</p>
              <button className="primary-button" onClick={() => setActivePage("Dashboard")}>
                Back to Dashboard
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
