export default {
  translation: {
    appName: "Менеджер задач",
    flash: {
      authError: "Доступ запрещён! Пожалуйста, авторизируйтесь.",
      session: {
        create: { success: "Вы залогинены", error: "Неправильный емейл или пароль" },
        delete: { success: "Вы разлогинены" },
      },
      users: {
        create: {
          success: "Пользователь успешно зарегистрирован",
          error: "Не удалось зарегистрировать",
        },
        update: {
          success: "Пользователь успешно изменён",
          error: "Не удалось изменить пользователя",
        },
        delete: {
          success: "Пользователь успешно удалён",
          error: "Не удалось удалить пользователя",
        },
        accessError: "Вы не можете редактировать или удалять другого пользователя",
      },
      statuses: {
        create: { success: "Статус успешно создан", error: "Не удалось создать статус" },
        update: { success: "Статус успешно изменён", error: "Не удалось изменить статус" },
        delete: { success: "Статус успешно удалён", error: "Не удалось удалить статус" },
      },
      labels: {
        create: { success: "Метка успешно создана", error: "Не удалось создать метку" },
        update: { success: "Метка успешно изменена", error: "Не удалось изменить метку" },
        delete: { success: "Метка успешно удалена", error: "Не удалось удалить метку" },
      },
      tasks: {
        create: { success: "Задача успешно создана", error: "Не удалось создать задачу" },
        update: { success: "Задача успешно изменена", error: "Не удалось изменить задачу" },
        delete: {
          success: "Задача успешно удалена",
          error: "Задачу может удалить только её автор",
        },
      },
    },
    layouts: {
      application: {
        users: "Пользователи",
        statuses: "Статусы",
        labels: "Метки",
        tasks: "Задачи",
        signIn: "Вход",
        signUp: "Регистрация",
        signOut: "Выход",
      },
    },
    views: {
      actions: { edit: "Изменить", delete: "Удалить", create: "Создать" },
      fields: {
        id: "ID",
        fullName: "Полное имя",
        firstName: "Имя",
        lastName: "Фамилия",
        email: "Email",
        password: "Пароль",
        name: "Наименование",
        description: "Описание",
        status: "Статус",
        creator: "Автор",
        executor: "Исполнитель",
        labels: "Метки",
        label: "Метка",
        createdAt: "Дата создания",
        actions: "Действия",
      },
      welcome: {
        hello: "Привет от Хекслета!",
        description: "Практические курсы по программированию",
        more: "Узнать больше",
      },
      session: { new: { title: "Вход", submit: "Войти" } },
      users: {
        title: "Пользователи",
        new: { title: "Регистрация", submit: "Сохранить" },
        edit: { title: "Изменение пользователя", submit: "Изменить" },
      },
      statuses: {
        title: "Статусы",
        create: "Создать статус",
        new: { title: "Создание статуса" },
        edit: { title: "Изменение статуса" },
      },
      labels: {
        title: "Метки",
        create: "Создать метку",
        new: { title: "Создание метки" },
        edit: { title: "Изменение метки" },
      },
      tasks: {
        title: "Задачи",
        create: "Создать задачу",
        new: { title: "Создание задачи" },
        edit: { title: "Изменение задачи" },
        filter: { isCreatorUser: "Только мои задачи", submit: "Показать" },
      },
    },
  },
};
