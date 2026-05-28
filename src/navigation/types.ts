export type AuthStackParams = {
  Login: undefined;
  Register: undefined;
};

export type StudentStackParams = {
  StudentHome: undefined;
  LessonDetail: { lessonId: string; title: string };
  Chat: { lessonId: string; moduleId?: string; title: string };
  JoinClass: undefined;
};

export type TeacherStackParams = {
  TeacherHome: undefined;
  UploadLesson: undefined;
  ReviewLesson: { lessonId: string; title: string };
  ManageClasses: undefined;
};
