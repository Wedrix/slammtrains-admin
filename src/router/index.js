import Vue from 'vue';
import VueRouter from 'vue-router';

import DashboardLayout from '@/views/layouts/Dashboard.vue';
import PlainLayout from '@/views/layouts/Plain.vue';

import firebase from '@/firebase';
import 'firebase/auth';
import 'firebase/firestore';

Vue.use(VueRouter);

const makeGuard = (guardType) => {
  return (to, from, next) => {
    firebase.auth().onAuthStateChanged(async user => {
      if (guardType === 'guest') {
        if (user) {
          next('/');
        }
        else {
          next();
        }
      }

      if (guardType === 'authenticated') {
        if (user) {
          next();
        }
        else {
          next('/auth');
        }
      }

      if (guardType === 'authenticatedAdmin') {
        if (user) {
          const idToken = await user.getIdTokenResult();

          const accessLevel = idToken.claims.accessLevel;

          if (accessLevel === 'admin') {
            next();
          }
          else {
            next('/auth/unauthorized');
          }
        } 
        else {
          next('/auth');
        }
      }
    });
  };
};

const routes = [
  {
    path: '/auth',
    component: PlainLayout,
    children: [
      {
        path: '/',
        name: 'Auth',
        component: () => import('@/views/pages/Auth.vue'),
        beforeEnter: makeGuard('guest'),
      },
      {
        path: 'unauthorized',
        name: 'Unauthorized',
        component: () => import('@/views/pages/Unauthorized.vue'),
        beforeEnter: makeGuard('authenticated'),
      },
    ],
  },
  {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: '/',
        name: 'Home',
        component: () => import('@/views/pages/Home.vue'),
      },
      {
        path: 'companies',
        component: () => import('@/views/pages/Companies.vue'),
        children: [
          {
            path: '/',
            name: 'CompaniesIndex',
            component: () => import('@/views/pages/Companies/Index.vue'),
          },
          {
            path: 'broadcast-email',
            name: 'BroadcastEmail',
            component: () => import('@/views/pages/Companies/BroadcastEmail.vue'),
          },
        ],
      },
      {
        path: 'courses',
        component: () => import('@/views/pages/Courses.vue'),
        children: [
          {
            path: '/',
            name: 'CoursesIndex',
            component: () => import('@/views/pages/Courses/Index.vue'),
          },
          {
            path: 'drafts',
            name: 'IndexCourseDrafts',
            component: () => import('@/views/pages/Courses/Drafts.vue'),
          },
          {
            path: 'requests',
            name: 'IndexCourseRequests',
            component: () => import('@/views/pages/Courses/Requests.vue'),
          },
          {
            path: 'create',
            name: 'CreateCourse',
            component: () => import('@/views/pages/Courses/Create.vue'),
          },
        ],
      },
      {
        path: 'plans',
        component: () => import('@/views/pages/Plans.vue'),
        children: [
          {
            path: '/',
            name: 'PlansIndex',
            component: () => import('@/views/pages/Plans/Index.vue'),
          },
          {
            path: 'create',
            name: 'CreatePlan',
            component: () => import('@/views/pages/Plans/Create.vue'),
          },
          {
            path: 'requests',
            name: 'IndexCustomPlanRequests',
            component: () => import('@/views/pages/Plans/Requests.vue'),
          },
        ],
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/pages/Settings.vue'),
      }
    ],
    beforeEnter: makeGuard('authenticatedAdmin'),
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
