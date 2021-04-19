function MyPromise(fn) {
  if (typeof fn !== "function") {
    throw Error(`Promise resolver ${fn} is not a funtion`);
  }
  this.state = "pending";
  this.data = null;
  this.resolvedArr = [];
  this.rejectedArr = [];
  var self = this;

  function resolved(data) {
    setTimeout(() => {
      if (self.state === "pending") {
        self.state = "resolved";
        self.data = data;
        self.resolvedArr.forEach((fn) => fn());
      }
    }, 0);
  }

  function rejected(err) {
    setTimeout(() => {
      if (self.state === "pending") {
        self.state = "rejected";
        self.data = err;
        self.rejectedArr.forEach((fn) => fn());
      }
    }, 0);
  }

  fn(resolved, rejected);
}

MyPromise.prototype.then = function (onResolved, onRejected) {
  return new MyPromise((resolved, rejected) => {
    if (this.state === "pending") {
      this.resolvedArr.push(
        ((onResolved) => {
          return () => {
            var res = onResolved(this.data);
            if (res instanceof MyPromise) {
              res.then(resolved, rejected);
            } else {
              resolved(res);
            }
          };
        })(onResolved)
      );
      this.rejectedArr.push(
        ((onRejected) => {
          return () => {
            var res = onRejected(this.data);
            if (res instanceof MyPromise) {
              res.then(resolved, rejected);
            } else {
              resolved(res);
            }
          };
        })(onRejected)
      );
    } else {
      var res =
        this.state === "resolved"
          ? onResolved(this.data)
          : onRejected(this.data);
      if (res instanceof MyPromise) {
        res.then(resolved, rejected);
      } else {
        resolved(res);
      }
    }
  });
};

var p = new MyPromise((resolved, rejected) => {
  console.log(1);
  resolved(2);
});
p.then((res) => console.log(res));
console.log(3);
