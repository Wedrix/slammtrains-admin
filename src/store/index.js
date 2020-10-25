import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const init = {
  notifications: [],
  admin: {
    name: '',
    email: '',
  },
};

export default new Vuex.Store({
  state: { ...init },
  getters: {
    //
  },
  mutations: {
    push_notification({ notifications }, { notification }) {
      notifications.splice(notifications.length, 1, notification);
    },
    pop_notification({ notifications }) {
      notifications.splice(0, 1);
    },
    set_admin(state, { admin }) {
      state.admin = admin;
    },
    clear_state(state) {
      state = Object.assign(state, { ...init });
    }
  },
  actions: {
    initialize({ commit }, { user }) {
      const admin = {
        name: user.displayName,
        email: user.email,
      };

      commit('set_admin', { admin });
    },
    clear({ commit }) {
      commit('clear_state');
    }
  },
  modules: {
  }
});
