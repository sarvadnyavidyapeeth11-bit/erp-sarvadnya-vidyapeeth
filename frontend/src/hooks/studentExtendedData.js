// Student extended modules use empty defaults until connected ERP records exist.
// Pages should render empty states instead of showing fake student/course data.

export const academicsData = {
  subjects: [],
  facultyList: [],
  syllabus: [],
  studyMaterials: [],
  recordedLectures: [],
  assignments: [],
  quizzes: [],
  projects: []
};

export const courseRegistrationData = {
  semester: "",
  session: "",
  maxCredits: 0,
  minCredits: 0,
  status: "Not Open",
  deadline: "",
  coreSubjects: [],
  electiveSubjects: []
};

export const examDetailsData = {
  examForms: [],
  hallTicket: {
    rollNo: "",
    studentName: "",
    examCenter: "",
    centerCode: "",
    dates: []
  },
  seatingPlan: {
    exam: "",
    roomNo: "",
    benchNo: "",
    reportingTime: ""
  },
  internalMarks: [],
  revaluationRequests: []
};

export const hostelData = {
  hostelName: "",
  roomNo: "",
  roomType: "",
  wardenName: "",
  wardenContact: "",
  messMenu: {},
  leavePasses: [],
  complaints: []
};

export const transportData = {
  busPassNo: "",
  routeNo: "",
  busNo: "",
  validTill: "",
  driverName: "",
  driverPhone: "",
  stops: [],
  liveStatus: {
    currentStop: "",
    nextStop: "",
    estimatedArrival: "",
    busSpeed: "",
    status: ""
  }
};

export const activitiesData = {
  events: [],
  clubs: [],
  certificates: []
};

export const communicationData = {
  facultyChats: [],
  mentorChat: {
    mentorName: "",
    messages: []
  },
  helpdeskTickets: []
};

export const documentsData = {
  uploaded: [],
  certificatesAvailable: [],
  digiLocker: {
    linkedAccount: "",
    status: "",
    syncedDocuments: []
  }
};

export const aiHubData = {
  studyPlan: [],
  savedSummaries: []
};
