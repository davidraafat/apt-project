import Course from './data/course.json';
import Courses from './data/myCourses.json';
import Stream from './data/stream.json';

const fetch = (mockData, time = 0) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData);
    }, time);
  });

export default {
  async fetchCourse(id) {
    console.log(id);
    const course = await fetch(Course, 1000);
    return course;
  },

  async fetchStream() {
    const stream = await fetch(Stream, 1000);
    return stream;
  },

  async fetchCourses() {
    const courses = await fetch(Courses, 1000);
    return courses;
  },

  unenroll() {
    return { status: 'success' };
  },
  addPost(courseId, title, text) {
    console.log('Course:' + courseId);
    console.log('title:' + title);
    console.log('body:' + text);
    return { status: 'success' };
  },
  addComment(postId, text) {
    console.log('Post:' + postId);
    console.log('body:' + text);
    return { status: 'success' };
  },
};
