import Vue from 'vue';
import VueRouter from 'vue-router';

import DashboardLayout from '@/views/layouts/Dashboard.vue';
import PlainLayout from '@/views/layouts/Plain.vue';

import firebase from '@/firebase';
import 'firebase/auth';
import 'firebase/firestore';

Vue.use(VueRouter);

const guardedValidation = (to, from, next) => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      user.getIdTokenResult().then(result => {
        if (result.claims.accessLevel === 'admin') {
          next();
        } else {
          next({path: '/signin', query: { unauthorized: true }});
        }
      });
    } else {
      next('/signin');
    }
  });
};

const guestValidation = (to, from, next) => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      user.getIdTokenResult().then(result => {
        if (result.claims.accessLevel === 'admin') {
          next('/');
        } else {
          next();
        }
      });
    } else {
      next();
    }
  });
};

const guardedRoutes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/pages/Home.vue')
  },
  {
    path: 'companies',
    name: 'Companies',
    component: () => import('../views/pages/Companies.vue')
  },
  {
    path: 'courses',
    name: 'Courses',
    component: () => import('../views/pages/Courses.vue')
  },
  {
    path: 'plans',
    name: 'Plans',
    component: () => import('../views/pages/Plans.vue')
  },
  {
    path: 'settings',
    name: 'Settings',
    component: () => import('../views/pages/Settings.vue')
  }
];

const authRoutes = [
  {
    path: '/signin',
    name: 'SignInPage',
    component: () => import('../views/pages/SignIn.vue'),
    beforeEnter: guestValidation
  },
];

const routes = [
  {
    path: '/auth',
    component: PlainLayout,
    children: authRoutes
  },
  {
    path: '/',
    component: DashboardLayout,
    children: guardedRoutes,
    beforeEnter: guardedValidation
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
