export default {
  translation: {
    appName: "Task Manager",
    flash: {
      authError: "Access denied! Please sign in.",
      session: {
        create: { success: "You are logged in", error: "Wrong email or password" },
        delete: { success: "You are logged out" },
      },
      users: {
        create: { success: "User registered successfully", error: "Failed to register" },
        update: { success: "User updated successfully", error: "Failed to update user" },
        delete: { success: "User deleted successfully", error: "Failed to delete user" },
        accessError: "You cannot edit or delete another user",
      },
      statuses: {
        create: { success: "Status created successfully", error: "Failed to create status" },
        update: { success: "Status updated successfully", error: "Failed to update status" },
        delete: { success: "Status deleted successfully", error: "Failed to delete status" },
      },
      labels: {
        create: { success: "Label created successfully", error: "Failed to create label" },
        update: { success: "Label updated successfully", error: "Failed to update label" },
        delete: { success: "Label deleted successfully", error: "Failed to delete label" },
      },
      tasks: {
        create: { success: "Task created successfully", error: "Failed to create task" },
        update: { success: "Task updated successfully", error: "Failed to update task" },
        delete: {
          success: "Task deleted successfully",
          error: "Only the author can delete the task",
        },
      },
    },
    layouts: {
      application: {
        users: "Users",
        statuses: "Statuses",
        labels: "Labels",
        tasks: "Tasks",
        signIn: "Sign in",
        signUp: "Sign up",
        signOut: "Sign out",
      },
    },
    views: {
      actions: { edit: "Edit", delete: "Delete", create: "Create" },
      fields: {
        id: "ID",
        fullName: "Full name",
        firstName: "First name",
        lastName: "Last name",
        email: "Email",
        password: "Password",
        name: "Name",
        description: "Description",
        status: "Status",
        creator: "Author",
        executor: "Executor",
        labels: "Labels",
        label: "Label",
        createdAt: "Created at",
        actions: "Actions",
      },
      welcome: {
        hello: "Hello from Hexlet!",
        description: "Online programming school",
        more: "Learn more",
      },
      session: { new: { title: "Sign in", submit: "Sign in" } },
      users: {
        title: "Users",
        new: { title: "Sign up", submit: "Save" },
        edit: { title: "Edit user", submit: "Update" },
      },
      statuses: {
        title: "Statuses",
        create: "Create status",
        new: { title: "New status" },
        edit: { title: "Edit status" },
      },
      labels: {
        title: "Labels",
        create: "Create label",
        new: { title: "New label" },
        edit: { title: "Edit label" },
      },
      tasks: {
        title: "Tasks",
        create: "Create task",
        new: { title: "New task" },
        edit: { title: "Edit task" },
        filter: { isCreatorUser: "Only my tasks", submit: "Show" },
      },
    },
  },
};
