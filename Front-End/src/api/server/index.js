import axios from 'axios';
import api from './config.js';

axios.interceptors.request.use(
  (config) => {
    const credConfig = config;
    credConfig.withCredentials = true;
    return credConfig;
  },
  (err) => Promise.reject(err),
);

export default {
  async fetchCourse(id) {
    return axios
      .get(`${api}/api/v1/courses/${id}`)
      .then((response) => response.data)
      .catch((error) => console.log(error));
  },

  login(username, password) {
    return axios.post(`${api}/api/v1/login`, { username, password });
  },

  logout() {
    return axios.get(`${api}/api/v1/logout`);
  },

  signup(username, password, email, type, phone) {
    return axios.post(`${api}/api/v1/register`, {
      username,
      password,
      email,
      type,
      phone,
    });
  },

  async fetchCourses() {
    return axios
      .post(`${api}/api/v1/courses/me`)
      .then((response) => response.data)
      .catch((error) => console.log(error));
  },

  async unenroll(courseId, studentId) {
    return axios
      .post(`${api}/api/v1/courses/${courseId}/unenroll/${studentId}`)
      .then((response) => response.data)
      .catch((error) => console.log(error));
  },

  async uploadSampleFile(courseID, file) {
    let formData = new FormData();
    formData.append('file', file);
    console.log(courseID);
    return axios
      .post(
        `${api}/api/v1/courses/${courseID}/upload`,
        formData,
        { credentials: 'include' },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      .then((resposne) => resposne.data)
      .catch((error) => console.log(error));
  },
  async enroll(key) {
    return axios
      .post(`${api}/api/v1/courses/enroll`, { key: key })
      .then((response) => response)
      .catch((err) => (err ? { status: 'failed' } : {}));
  },

  async addCourse(name, key) {
    return axios
      .post(`${api}/api/v1/courses/create`, { name: name, key: key })
      .then((response) => response)
      .catch((err) => (err ? { status: 'failed' } : {}));
  },

  async addComment(postId, text) {
    return axios
      .post(`${api}/api/v1/posts/${postId}/comments/create`, { body: text })
      .then((response) => response)
      .catch((err) => (err ? { status: 'failed' } : {}));
  },

  async addPost(courseId, title, text) {
    return axios
      .post(`${api}/api/v1/courses/${courseId}/posts/create`, {
        title: title,
        body: text,
      })
      .then((response) => response)
      .catch((err) => (err ? { status: 'failed' } : {}));
  },
};
