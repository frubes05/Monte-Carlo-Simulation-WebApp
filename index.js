class MonteCarloSimulation {
  constructor() {
    this.#bindEvents();
    this.body = document.querySelector("body");
    this.tables = document.querySelector(".tables");
    this.spinners = document.querySelector(".spinners");
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
    setTimeout(()=> {
        for (let i = 0; i < 8; i++) {
            this.array.push(Math.floor(Math.random() * 100));
          }
          this.randomNumbers = this.array;
          this.getWholeMinutes(this.array, clicked);
          this.array.length = 0;
    }, 1000);
  }

  showSpinners() {
    this.body.style.overflow = "hidden";
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
    if (state) {
        document.querySelectorAll(".table").forEach(table => {
            table.remove();
        });
    };
    random_numbers.forEach((num) => {
      if (num <= 39) {
        this.minutesPerAppointment.push(0.4 * 45);
      } else if (num > 39 && num <= 54) {
        this.minutesPerAppointment.push(0.15 * 60);
      } else if (num > 54 && num <= 69) {
        this.minutesPerAppointment.push(0.15 * 15);
      } else if (num > 69 && num <= 79) {
        this.minutesPerAppointment.push(0.1 * 45);
      } else if (num > 79) {
        this.minutesPerAppointment.push(0.2 * 15);
      }
    });
    this.getWaitingLine(this.minutesPerAppointment);
    this.getEmptyWalk(this.minutesPerAppointment);
    this.createInitialTable();
    this.createConclusionTable();
    this.minutesPerAppointment = [];
    console.log(this.patients);
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
      <td>&Sigma; ${this.meanOver30}</td>
      <td>&Sigma; ${this.meanEmptyWalk.toFixed(2)}</td>
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

  getEmptyWalk(sum_arr) {
    sum_arr.splice(-1, 1);
    const remainder = sum_arr.map((elem) => 30 - elem);
    remainder.unshift(0);
    this.emptyWalkArr = remainder;
    console.log(this.emptyWalkArr);
    this.meanEmptyWalk = this.sumArray(remainder) / this.randomNumbers.length;
  }

  getWaitingLine(sum_arr) {
    const over30 = sum_arr.map((elem) => (elem <= 30 ? 0 : elem - 30));
    this.over30Arr = over30;
    console.log(this.over30Arr);
    this.meanOver30 = this.sumArray(over30) / this.randomNumbers.length;
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
  }
}

new MonteCarloSimulation();
