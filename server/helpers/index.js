import { fullName } from "../models/users.js";

const alertClasses = {
  error: "border-red-300 bg-red-50 text-red-800",
  success: "border-green-300 bg-green-50 text-green-800",
  info: "border-blue-300 bg-blue-50 text-blue-800",
};

export default (app) => ({
  route: (name, params) => app.reverse(name, params),
  t: (key, params) => app.t(key, params),
  assetPath: (filename) => `/assets/${filename}`,
  fullName,
  alertClass: (type) => alertClasses[type] ?? alertClasses.info,
  formatDate: (value) => new Date(value).toLocaleString("ru-RU"),
  fieldErrors: (errors, name) => (errors?.[name] ?? []).join(". "),
});
