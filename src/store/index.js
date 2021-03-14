import Vue from 'vue';
import Vuex from 'vuex';

import firebase from '@/firebase';
import 'firebase/firestore';

import { vuexfireMutations, firestoreAction } from 'vuexfire';
import { firestoreOptions } from 'vuexfire';

firestoreOptions.serialize = snapshot => {
  return Object.defineProperty(snapshot.data(), 'id', 
      { 
          value: snapshot.id, 
          enumerable: true, 
          configurable: true, 
          writable: true 
      });
};

import { cloneDeep } from 'lodash';

Vue.use(Vuex);

const init = {
  notifications: [],
  notification: {
    message: '',
    context: '',
    timeout: 3000,
    tag: '',
  },
  admin: {
    name: '',
    email: '',
  },
  settings: {
    business: {
      name: '',
      supportEmail: '',
    },
    companyRegistration: {
      companySizes: [],
      industries: [],
    },
    course: {
      daysToOld: null,
    },
  },
  documentCounters: {
    companies: 0,
    courses: 0,
    courseRequests: 0,
    plans: 0,
    customCourseRequests: 0,
  },
};

const match = (a, b) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export default new Vuex.Store({
  state: cloneDeep(init),
  getters: {
    //
  },
  mutations: {
    ...vuexfireMutations,
    push_notification({ notifications }, { notification }) {
      notifications.splice(notifications.length, 1, Object.assign({}, init.notification, notification));
    },
    pop_notification({ notifications }) {
      notifications.splice(0, 1);
    },
    set_notification(state, { notification }) {
      state.notification = notification;
    },
    set_admin(state, { admin }) {
      state.admin = admin;
    },
    clear_state(state) {
      state = Object.assign(state, cloneDeep(init));
    }
  },
  actions: {
    initializeSettings: firestoreAction(async ({ bindFirestoreRef, state }) => {
      if (match(state.settings, init.settings)) {
        const settingsRef = firebase.firestore()
                                    .doc(`settings/index`);

        await bindFirestoreRef('settings', settingsRef, { wait: true });
      }
    }),
    initializeAdmin: firestoreAction(async ({ bindFirestoreRef, commit }, { user }) => {
      const admin = {
        name: user.displayName,
        email: user.email,
      };

      commit('set_admin', { admin });
    }),
    initializeDocumentCounters: firestoreAction(async ({ bindFirestoreRef, state }) => {
      if (match(state.documentCounters, init.documentCounters)) {
        const documentCountersRef = firebase.firestore()
                                    .doc(`documentCounters/index`);

        await bindFirestoreRef('documentCounters', documentCountersRef, { wait: true });
      }
    }),
    clear({ commit }) {
      commit('clear_state');
    }
  },
  modules: {
  }
});
