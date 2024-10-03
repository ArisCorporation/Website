interface State {
  expires: number | undefined;
  refresh_token: string | undefined;
  access_token: string | undefined;
  expires_at: number | undefined;
}

export const useAuthStore = defineStore('ams:auth_store', {
  state: (): State => ({
    expires: undefined,
    refresh_token: undefined,
    access_token: undefined,
    expires_at: undefined,
  }),
  actions: {
    setData(data: State) {
      if (data) {
        const { expires, refresh_token, access_token, expires_at } = data;
        this.expires = expires;
        this.refresh_token = refresh_token;
        this.access_token = access_token;
        this.expires_at = expires_at;
      } else {
				this.expires = undefined;
				this.refresh_token = undefined;
				this.access_token = undefined;
				this.expires_at = undefined;
			}
    },
  },
  persist: {
    storage: persistedState.cookiesWithOptions({
      sameSite: 'strict',
    }),
  },
});
