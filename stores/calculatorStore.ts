interface State {
  data: any;
}

export const useCalculatorStore = defineStore('calulator', {
  state: (): State => ({
    data: null,
  }),
  actions: {
    setData(data: any) {
      this.data = data;
    },
  },
});
