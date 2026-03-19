const fs = require('fs');

const files = {
  uz: 'c:\\Users\\HP\\OneDrive\\Desktop\\Work\\ilmplyus\\src\\messages\\uz.json',
  ru: 'c:\\Users\\HP\\OneDrive\\Desktop\\Work\\ilmplyus\\src\\messages\\ru.json',
  en: 'c:\\Users\\HP\\OneDrive\\Desktop\\Work\\ilmplyus\\src\\messages\\en.json'
};

const translations = {
  uz: {
    filterDropdown: {
      sort: "Saralash",
      activeFiltersBadge: "{{count}} ta faol filtr",
      filterPanel: "Filtrlar paneli",
      source: "Manba",
      gender: "Jinsi",
      direction: "Yo'nalish",
      clear: "Tozalash",
      activeFilters: "{{count}} ta filtr faol",
      openSubDirections: "{{name}} kichik yo'nalishlarini ochish",
      closeSubDirections: "{{name}} kichik yo'nalishlarini yopish",
      subDirections: "{{name}} kichik yo'nalishlari"
    },
    leadDetailsModal: {
      closeModal: "Modalni yopish",
      registrationTime: "REGISTRATSIYA VAQTI",
      education: "TA'LIM",
      course: "KURS",
      level: "BOSQICH",
      group: "GURUH",
      note: "IZOH",
      save: "SAQLASH",
      id: "ID"
    },
    lidColumn: {
      columnAria: "{{title}} ustuni",
      menuAria: "{{title}} ustuni menyusi",
      source: "MANBA",
      courses: "KURSLAR"
    },
    modalPattern: {
      close: "Yopish"
    },
    shartnomaModal: {
      signedContract: { title: "Shartnoma qildi", desc: "Mijoz shartnoma imzoladi" },
      paid: { title: "To'lov qildi", desc: "Mijoz to'lovni amalga oshirdi" },
      editStatus: "HOLATNI TAHRIRLASH",
      unknown: "Noma’lum",
      contractAndPayment: "SHARTNOMA VA TO'LOV",
      tabContract: "Shartnoma va to'lov",
      tabContact: "Aloqa",
      tabDemo: "Demo dars",
      subStatus: "Sub-status",
      noteOptional: "Izoh(IXTIYORIY)",
      writeNote: "Izoh yozing...",
      cancel: "Bekor qilish",
      save: "Saqlash"
    },
    registrationModal: {
      errors: {
        lastName: "Familiya kiritilishi shart",
        firstName: "Ism kiritilishi shart",
        birthDate: "Tug'ilgan sana kiritilishi shart",
        gender: "Jinsi tanlanishi shart",
        phone: "Telefon raqami kiritilishi shart",
        phoneFormat: "Noto'g'ri format. Misol: +998 90 123 45 67",
        regionId: "Viloyat tanlanishi shart",
        districtId: "Shahar/tuman kiritilishi shart",
        branchId: "Filial tanlanishi shart",
        courseId: "Kurs tanlanishi shart",
        levelId: "Bosqich tanlanishi shart",
        groupId: "Guruh tanlanishi shart",
        sourceId: "Manba tanlanishi shart"
      },
      edit: "Tahrirlash",
      create: "Ro'yhatga olish",
      closeModal: "Modalni yopish",
      fields: {
        lastName: "Familya",
        firstName: "Ism",
        middleName: "Otasining ismi",
        birthDate: "Tug'ilgan sana",
        gender: "Jinsi",
        phone: "Telefon raqami",
        regionId: "Viloyat",
        districtId: "Shahar(tuman)",
        branchId: "Fillial",
        courseId: "Kurs",
        levelId: "Bosqich",
        groupId: "Guruh",
        sourceId: "Manba",
        noteOptional: "Izoh(ixtiyoriy)"
      },
      placeholders: {
        lastName: "Aliev",
        firstName: "Alijon",
        middleName: "Aliyevich",
        regionId: "Viloyat tanlang",
        districtId: "Shahar yoki tuman",
        branchId: "Fillial tanlang",
        courseId: "Kurs tanlang",
        levelId: "Bosqich tanlang",
        groupId: "Guruh tanlang",
        sourceId: "Manba tanlang"
      },
      gender: { male: "Erkak", female: "Ayol" },
      cancel: "Bekor qilish",
      save: "Saqlash",
      add: "Qo'shish"
    },
    taskCard: {
      priority: { urgent: "Shoshilinch", medium: "O'rta", low: "Bemalol" },
      lidId: "Lid id",
      managerComment: "Menejer izohi",
      operatorComment: "Operator izohi",
      editBtn: "Tahrirlash",
      deleteBtn: "O'chirish",
      status: { completed: "Yakunlangan", failed: "Bajarilmadi", inProgress: "Bajarilmoqda" },
      btn: { start: "Bajarish", done: "Bajarildi", notDone: "Bajarilmadi", cancel: "Bekor" },
      writeCommentPlaceholder: "Izoh yozing..."
    },
    taskModal: {
      editTitle: "Vazifani tahrirlash",
      createTitle: "Yangi vazifa yaratish",
      selectLid: "Lidni tanlang",
      lidPlaceholder: "FISH yoki lid id raqami yozing...",
      priority: "Vazifa ustuvorligi",
      priorityOptions: { shoshilinch: "Shoshilinch", orta: "O'rta", sekin: "Bemalol" },
      date: "Sana",
      time: "Vaqt",
      operator: "Mas'ul operator",
      selectOperator: "Operatorni tanlang",
      comment: "Izoh",
      saving: "Saqlanmoqda...",
      saveBtn: "Vazifani saqlash"
    },
    tasks: {
      filter: { barchasi: "Barchasi", bajarish: "Bajarilmoqda", bajarildi: "Yakunlangan", bajarilmadi: "Bajarilmadi" },
      allOperators: "Barcha operatorlar",
      role: "Rol",
      createTask: "Vazifa yaratish",
      taskList: "Vazifalar ro'yhati",
      loading: "Yuklanmoqda...",
      error: "Ma'lumotlarni yuklashda xatolik yuz berdi.",
      noTasks: "Vazifalar topilmadi."
    },
    notFound: {
      "404": "404",
      page: "sahifa",
      notFound: "topilmadi"
    }
  },
  ru: {
    filterDropdown: {
      sort: "Сортировка",
      activeFiltersBadge: "{{count}} акт. фильтров",
      filterPanel: "Панель фильтров",
      source: "Источник",
      gender: "Пол",
      direction: "Направление",
      clear: "Очистить",
      activeFilters: "{{count}} акт. фильтров",
      openSubDirections: "Открыть поднаправления {{name}}",
      closeSubDirections: "Закрыть поднаправления {{name}}",
      subDirections: "поднаправления {{name}}"
    },
    leadDetailsModal: {
      closeModal: "Закрыть окно",
      registrationTime: "ВРЕМЯ РЕГИСТРАЦИИ",
      education: "ОБРАЗОВАНИЕ",
      course: "КУРС",
      level: "УРОВЕНЬ",
      group: "ГРУППА",
      note: "ПРИМЕЧАНИЕ",
      save: "СОХРАНИТЬ",
      id: "ID"
    },
    lidColumn: {
      columnAria: "Столбец {{title}}",
      menuAria: "Меню столбца {{title}}",
      source: "ИСТОЧНИК",
      courses: "КУРСЫ"
    },
    modalPattern: {
      close: "Закрыть"
    },
    shartnomaModal: {
      signedContract: { title: "Заключен договор", desc: "Клиент подписал договор" },
      paid: { title: "Произведена оплата", desc: "Клиент произвел оплату" },
      editStatus: "РЕДАКТИРОВАНИЕ СТАТУСА",
      unknown: "Неизвестно",
      contractAndPayment: "ДОГОВОР И ОПЛАТА",
      tabContract: "Договор и оплата",
      tabContact: "Контакт",
      tabDemo: "Демо-урок",
      subStatus: "Подстатус",
      noteOptional: "Примечание (НЕОБЯЗАТЕЛЬНО)",
      writeNote: "Напишите примечание...",
      cancel: "Отмена",
      save: "Сохранить"
    },
    registrationModal: {
      errors: {
        lastName: "Фамилия обязательна",
        firstName: "Имя обязательно",
        birthDate: "Дата рождения обязательна",
        gender: "Пол обязателен",
        phone: "Номер телефона обязателен",
        phoneFormat: "Неверный формат. Пример: +998 90 123 45 67",
        regionId: "Регион обязателен",
        districtId: "Город/район обязателен",
        branchId: "Филиал обязателен",
        courseId: "Курс обязателен",
        levelId: "Уровень обязателен",
        groupId: "Группа обязательна",
        sourceId: "Источник обязателен"
      },
      edit: "Редактировать",
      create: "Регистрация",
      closeModal: "Закрыть окно",
      fields: {
        lastName: "Фамилия",
        firstName: "Имя",
        middleName: "Отчество",
        birthDate: "Дата рождения",
        gender: "Пол",
        phone: "Номер телефона",
        regionId: "Регион",
        districtId: "Город(район)",
        branchId: "Филиал",
        courseId: "Курс",
        levelId: "Уровень",
        groupId: "Группа",
        sourceId: "Источник",
        noteOptional: "Примечание(необязательно)"
      },
      placeholders: {
        lastName: "Алиев",
        firstName: "Алижон",
        middleName: "Алиевич",
        regionId: "Выберите регион",
        districtId: "Город или район",
        branchId: "Выберите филиал",
        courseId: "Выберите курс",
        levelId: "Выберите уровень",
        groupId: "Выберите группу",
        sourceId: "Выберите источник"
      },
      gender: { male: "Мужской", female: "Женский" },
      cancel: "Отмена",
      save: "Сохранить",
      add: "Добавить"
    },
    taskCard: {
      priority: { urgent: "Срочный", medium: "Средний", low: "Низкий" },
      lidId: "ID Лида",
      managerComment: "Комм. менеджера",
      operatorComment: "Комм. оператора",
      editBtn: "Редактировать",
      deleteBtn: "Удалить",
      status: { completed: "Выполнено", failed: "Провалено", inProgress: "В процессе" },
      btn: { start: "Начать", done: "Готово", notDone: "Не готово", cancel: "Отмена" },
      writeCommentPlaceholder: "Напишите комментарий..."
    },
    taskModal: {
      editTitle: "Редактировать задачу",
      createTitle: "Создать новую задачу",
      selectLid: "Выберите лида",
      lidPlaceholder: "Введите ФИО или ID лида...",
      priority: "Приоритет задачи",
      priorityOptions: { shoshilinch: "Срочный", orta: "Средний", sekin: "Низкий" },
      date: "Дата",
      time: "Время",
      operator: "Отв. оператор",
      selectOperator: "Выберите оператора",
      comment: "Комментарий",
      saving: "Сохранение...",
      saveBtn: "Сохранить задачу"
    },
    tasks: {
      filter: { barchasi: "Все", bajarish: "В процессе", bajarildi: "Выполнено", bajarilmadi: "Провалено" },
      allOperators: "Все операторы",
      role: "Роль",
      createTask: "Создать задачу",
      taskList: "Список задач",
      loading: "Загрузка...",
      error: "Произошла ошибка при загрузке данных.",
      noTasks: "Задачи не найдены."
    },
    notFound: {
      "404": "404",
      page: "страница",
      notFound: "не найдена"
    }
  },
  en: {
    filterDropdown: {
      sort: "Sort",
      activeFiltersBadge: "{{count}} active filters",
      filterPanel: "Filter Panel",
      source: "Source",
      gender: "Gender",
      direction: "Direction",
      clear: "Clear",
      activeFilters: "{{count}} active filters",
      openSubDirections: "Open {{name}} sub-directions",
      closeSubDirections: "Close {{name}} sub-directions",
      subDirections: "{{name}} sub-directions"
    },
    leadDetailsModal: {
      closeModal: "Close Modal",
      registrationTime: "REGISTRATION TIME",
      education: "EDUCATION",
      course: "COURSE",
      level: "LEVEL",
      group: "GROUP",
      note: "NOTE",
      save: "SAVE",
      id: "ID"
    },
    lidColumn: {
      columnAria: "{{title}} column",
      menuAria: "{{title}} column menu",
      source: "SOURCE",
      courses: "COURSES"
    },
    modalPattern: {
      close: "Close"
    },
    shartnomaModal: {
      signedContract: { title: "Contract Signed", desc: "The client has signed the contract" },
      paid: { title: "Payment Made", desc: "The client has completed payment" },
      editStatus: "EDIT STATUS",
      unknown: "Unknown",
      contractAndPayment: "CONTRACT AND PAYMENT",
      tabContract: "Contract and Payment",
      tabContact: "Contact",
      tabDemo: "Demo Class",
      subStatus: "Sub-status",
      noteOptional: "Note (OPTIONAL)",
      writeNote: "Write a note...",
      cancel: "Cancel",
      save: "Save"
    },
    registrationModal: {
      errors: {
        lastName: "Last name is required",
        firstName: "First name is required",
        birthDate: "Date of birth is required",
        gender: "Gender must be specified",
        phone: "Phone number is required",
        phoneFormat: "Invalid format. Example: +998 90 123 45 67",
        regionId: "Region must be selected",
        districtId: "District/City must be provided",
        branchId: "Branch must be selected",
        courseId: "Course must be selected",
        levelId: "Level must be selected",
        groupId: "Group must be selected",
        sourceId: "Source must be selected"
      },
      edit: "Edit",
      create: "Registration",
      closeModal: "Close Modal",
      fields: {
        lastName: "Last Name",
        firstName: "First Name",
        middleName: "Middle Name",
        birthDate: "Date of Birth",
        gender: "Gender",
        phone: "Phone Number",
        regionId: "Region",
        districtId: "District(City)",
        branchId: "Branch",
        courseId: "Course",
        levelId: "Level",
        groupId: "Group",
        sourceId: "Source",
        noteOptional: "Note(optional)"
      },
      placeholders: {
        lastName: "Aliev",
        firstName: "Alijon",
        middleName: "Aliyevich",
        regionId: "Select Region",
        districtId: "City or District",
        branchId: "Select Branch",
        courseId: "Select Course",
        levelId: "Select Level",
        groupId: "Select Group",
        sourceId: "Select Source"
      },
      gender: { male: "Male", female: "Female" },
      cancel: "Cancel",
      save: "Save",
      add: "Add"
    },
    taskCard: {
      priority: { urgent: "Urgent", medium: "Medium", low: "Low" },
      lidId: "Lead ID",
      managerComment: "Manager's Comment",
      operatorComment: "Operator's Comment",
      editBtn: "Edit",
      deleteBtn: "Delete",
      status: { completed: "Completed", failed: "Failed", inProgress: "In Progress" },
      btn: { start: "Start", done: "Done", notDone: "Not Done", cancel: "Cancel" },
      writeCommentPlaceholder: "Write a comment..."
    },
    taskModal: {
      editTitle: "Edit Task",
      createTitle: "Create New Task",
      selectLid: "Select Lead",
      lidPlaceholder: "Enter full name or lead ID...",
      priority: "Task Priority",
      priorityOptions: { shoshilinch: "Urgent", orta: "Medium", sekin: "Low" },
      date: "Date",
      time: "Time",
      operator: "Assigned Operator",
      selectOperator: "Select Operator",
      comment: "Comment",
      saving: "Saving...",
      saveBtn: "Save Task"
    },
    tasks: {
      filter: { barchasi: "All", bajarish: "In Progress", bajarildi: "Completed", bajarilmadi: "Failed" },
      allOperators: "All Operators",
      role: "Role",
      createTask: "Create Task",
      taskList: "Task List",
      loading: "Loading...",
      error: "An error occurred while loading data.",
      noTasks: "No tasks found."
    },
    notFound: {
      "404": "404",
      page: "page",
      notFound: "not found"
    }
  }
};

async function updateTranslations() {
  for (const lang of Object.keys(files)) {
    const rawData = fs.readFileSync(files[lang], 'utf-8');
    const existing = JSON.parse(rawData);
    const newLangData = translations[lang];

    // Merge logic
    for (const key of Object.keys(newLangData)) {
      existing[key] = { ...existing[key], ...newLangData[key] };
    }

    fs.writeFileSync(files[lang], JSON.stringify(existing, null, 2), 'utf-8');
    console.log(`Updated ${lang}.json`);
  }
}

updateTranslations();
