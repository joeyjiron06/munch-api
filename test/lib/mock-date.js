let dateNow = Date.now;

module.exports = {
  init() {
    this.tickTime = 0;
    Date.now = () => {
      return dateNow() + this.tickTime;
    };
  },

  restore() {
    Date.now = dateNow;
  },

  tick(mills) {
    this.tickTime = mills;
  },
};
