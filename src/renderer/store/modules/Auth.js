const state = {
  auth: false,
  authNeed: false,
}

const mutations = {
  AuthChange(state,arg) {
    state.auth = arg;
  },
  AuthNeedChange(state,arg) {
    state.authNeed = arg;
  },

}
const getters = {
  getAuth: (state) => {
    return state.auth;
  },
  getAuthNeed: (state) => {
    return state.authNeed;
  }
}
const actions = {
}

export default {
  state,
  mutations,
  actions,
  getters
}
