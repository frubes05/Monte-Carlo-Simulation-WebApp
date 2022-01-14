class MonteCarloSimulation {
  constructor() {
    this.#bindEvents();
    this.body = document.querySelector("body");
    this.tables = document.querySelector(".tables");
    this.spinners = document.querySelector(".spinners");
    this.predictedTimes = [30, 60, 90, 120, 150, 180, 210, 240];
    this.array = [];
    this.patients = [
      {
        patient: "P1",
        time: 45,
        probabillity: 0.4,
      },
      {
        patient: "P2",
        time: 60,
        probabillity: 0.15,
      },
      {
        patient: "P3",
        time: 15,
        probabillity: 0.15,
      },
      {
        patient: "P4",
        time: 45,
        probabillity: 0.1,
      },
      {
        patient: "P5",
        time: 15,
        probabillity: 0.2,
      },
    ];
    this.randomNumbers = [40, 82, 11, 34, 25, 66, 17, 79];
    this.minutesPerAppointment = [];
    this.emptyWalkArr = [];
    this.meanEmptyWalk;
    this.over30Arr = [];
    this.meanOver30;
    this.getWholeMinutes(this.randomNumbers);
  }

  randomize(clicked) {
    this.showSpinners();
    document.querySelector(".new__predictions").disabled = true;
    document.querySelector(".new__predictions").classList.add("btn-secondary");
    setTimeout(()=> {
        for (let i = 0; i < 8; i++) {
            this.array.push(Math.floor(Math.random() * 100));
          }
          this.randomNumbers = this.array;
          this.getWholeMinutes(this.array, clicked);
          this.array.length = 0;
    }, 1000);
    setTimeout(() => {
      document.querySelector(".new__predictions").disabled = false;
      document.querySelector(".new__predictions").classList.remove("btn-secondary");
    }, 2500)
  }

  fadeEffect () {
    sessionStorage.getItem("session") ? this.tables.classList.remove("fadein__first") :  this.tables.classList.add("fadein__first");
    sessionStorage.setItem("session", true);
  }

  showSpinners() {
    this.body.style.overflow = "hidden";
    this.tables.classList.contains("fadein__first") ? this.tables.classList.remove("fadein__first") : "";
    this.tables.classList.contains("fadein") ? this.tables.classList.remove("fadein") : "";
    this.spinners.classList.add("spinners__active");
    this.tables.classList.add("fadeout");
    setTimeout(() => {
        this.body.style.overflow = "auto";
        this.spinners.classList.remove("spinners__active");
        this.tables.classList.add("fadein");
        this.tables.classList.remove("fadeout");
    }, 2000)
  }

  getWholeMinutes(random_numbers, state) {
    this.emptyWalkArr.length = 0;
    this.over30Arr.length = 0;
    if (state) {
        document.querySelectorAll(".table").forEach(table => {
            table.remove();
        });
    };
    random_numbers.forEach((num) => {
      if (num <= 39) {
        this.minutesPerAppointment.push(45);
      } else if (num > 39 && num <= 54) {
        this.minutesPerAppointment.push(60);
      } else if (num > 54 && num <= 69) {
        this.minutesPerAppointment.push(15);
      } else if (num > 69 && num <= 79) {
        this.minutesPerAppointment.push(45);
      } else if (num > 79) {
        this.minutesPerAppointment.push(15);
      }
    });
    this.getWaitingLine(this.minutesPerAppointment);
    this.getEmptyWalk();
    this.createInitialTable();
    this.createConclusionTable();
    this.minutesPerAppointment = [];
  }

  createInitialTable() {
    let table = document.createElement("table");
    table.classList.add("table");
    let thead = document.createElement("thead");
    thead.classList.add("thead-light");
    thead.innerHTML = `
    <tr>
      <th scope="col">Pregled</th>
      <th scope="col">Vrijeme obrade (min)</th>
      <th scope="col">Vjerojatnost pregleda (%)</th>
    </tr>
    `;
    table.appendChild(thead);
    let tbody = document.createElement("tbody");
    tbody.classList.add("tbody");
    this.patients.forEach((procedure) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <th scope="row">${procedure.patient}</th>
        <td>${procedure.time}</td>
        <td>${procedure.probabillity}</td>
        `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    this.tables.appendChild(table);
  }

  createConclusionTable() {
    const returnedData = this.unifyBothTasks();
    let table = document.createElement("table");
    table.classList.add("table");
    let thead = document.createElement("thead");
    thead.classList.add("thead-light");
    thead.innerHTML = `
    <tr>
      <th scope="col">Slučajni brojevi</th>
      <th scope="col">Vrijeme čekanja pacijenta (min)</th>
      <th scope="col">Vrijeme praznog hoda (min)</th>
    </tr>
    `;
    table.appendChild(thead);
    let tbody = document.createElement("tbody");
    tbody.classList.add("tbody");
    returnedData.forEach((info) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${info.random}</td>
        <td>${info.waiting}</td>
        <td>${info.emptyWalk}</td>
        `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    let tfoot = document.createElement("tfoot");
    tfoot.innerHTML = `
    <tr>
      <td></td>
      <td class="results">
        <div class="results__div">
        <p class="text">
          <span>t</span>
          <sub>ček</sub>
          <span> = ${this.meanOver30} </span>
        </p>
        </div>
      </td>
      <td class="results">
        <div class="results__div">
        <p class="text">
          <span>t</span>
          <sub>praz</sub>
          <span> = ${this.meanEmptyWalk} </span>
        </p>
        </div>
      </td>
    </tr>`;
    tfoot.classList.add("tfoot");
    table.appendChild(tfoot);
    this.tables.appendChild(table);
  }

  unifyBothTasks() {
    const unified = [];
    for (let i = 0; i < 8; i++) {
      unified.push({
        random: this.randomNumbers[i],
        waiting: this.over30Arr[i],
        emptyWalk: this.emptyWalkArr[i],
      });
    }
    return unified;
  }

  getEmptyWalk() {
    this.meanEmptyWalk = this.sumArray(this.emptyWalkArr) / this.randomNumbers.length;
  }

  getWaitingLine(sum_arr) {
    const realTimes = [];
    for(let i = 0; i<sum_arr.length; i++) {
      i > 0 ? realTimes.push(realTimes[i-1] + sum_arr[i]) : realTimes.push(sum_arr[0]);
    }
    let over30 = realTimes.map((elem, i) => elem - this.predictedTimes[i]);
    over30.splice(-1, 1);
    over30.unshift(0);
    this.over30Arr = this.formulateArrays(over30);
    this.meanOver30 = this.sumArray(this.over30Arr) / this.randomNumbers.length;
  }

  formulateArrays(formulate_arr) {
    formulate_arr = formulate_arr.map((elem) => {
      if(elem >= 0) {
        this.emptyWalkArr.push(0);
        return elem;
      } else {
        this.emptyWalkArr.push(Math.abs(elem));
        return 0;
      }
    })
    return formulate_arr;
  }

  sumArray(sum_arr) {
    const sum = sum_arr.reduce((prev, curr) => prev + curr, 0);
    return sum;
  }

  throttle=(fn,delay)=>{
    let last=0;
    return function(...args){
      const now=new Date().getTime();
      if(now-last<delay){
        return
      }
      last=now;
      return fn(...args);
    }
  }

  #bindEvents() {
    document.querySelector(".new__predictions").addEventListener("click", this.throttle(this.randomize.bind(this, true), 1500));
    window.addEventListener("load", this.fadeEffect.bind(this));
  }
}

new MonteCarloSimulation();
