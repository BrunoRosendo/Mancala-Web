class Timer {
  static numberSize = 16;
  static textColor = "black";
  static circWidth = 12;
  static circActiveColor = "#A85FE8";
  static circDangerColor = "#DF0000";
  static circInactiveColor = "lightgray";

  constructor(canvasId, seconds) {
    this.base = document.getElementById(canvasId);
    this.gc = this.base.getContext("2d");
    this.center = {
      x: this.base.width / 2,
      y: this.base.height / 2,
    };
    this.length = Math.min(this.center.x, this.center.y);
    this.totalSecs = seconds;
    this.currentSecs = seconds;
    this.angleInc = (2 * Math.PI) / this.totalSecs;

    this.show();
    this.interval = setInterval(this.update.bind(this), 1000);
  }

  update() {
    this.currentSecs = Math.max(0, this.currentSecs - 1);
    this.show();
  }

  show() {
    this.base.width = this.base.width;
    this.gc.translate(this.center.x, this.center.y);
    this.gc.textAlign = "center";
    this.gc.textBaseline = "middle";
    this.gc.font = Timer.numberSize + "pt Arial bold";

    this.drawActiveCircle(this.gc);
    this.drawInactiveCircle(this.gc);
    this.drawTime(this.gc);
  }

  drawActiveCircle(gc) {
    let circle = new Path2D(); // <<< Declaration
    circle.arc(0, 0, this.length - Timer.circWidth / 2, 0, 2 * Math.PI, false);

    gc.lineWidth = Timer.circWidth;
    gc.strokeStyle =
      this.currentSecs > 60 ? Timer.circActiveColor : Timer.circDangerColor;
    gc.stroke(circle);
  }

  drawInactiveCircle(gc) {
    let circle = new Path2D(); // <<< Declaration
    const startAng = 1.5 * Math.PI;
    const finalAng =
      startAng - this.angleInc * (this.totalSecs - this.currentSecs);
    circle.arc(
      0,
      0,
      this.length - Timer.circWidth / 2,
      startAng,
      finalAng,
      true
    );

    gc.lineWidth = Timer.circWidth;
    gc.strokeStyle = Timer.circInactiveColor;
    gc.stroke(circle);
  }

  parseSeconds() {
    const minutes = Math.floor(this.currentSecs / 60);
    const seconds = this.currentSecs - minutes * 60;

    const minuteString = ("0" + minutes).slice(-2);
    const secondsStirng = ("0" + seconds).slice(-2);

    return [minuteString, secondsStirng];
  }

  drawTime(gc) {
    const [minutes, seconds] = this.parseSeconds();

    gc.fillStyle = Timer.textColor;
    gc.fillText(`${minutes} : ${seconds}`, 0, 0);
  }

  destroy() {
    this.base.width = this.base.width;
    clearInterval(this.interval);
  }
}
