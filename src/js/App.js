import addCommasToNumber from './addCommasToNumber.js';

export default class App {
  $target;
  state;
  timeoutId;

  constructor(target) {
    this.$target = target;
    //items: {id:number, price: number, count: number, date: 'yyyy-mm-dd'}[]
    //stocks: {id: number, name: string, items: {id:number, price: number, count: number, date: 'yyyy-mm-dd'}[]}[]
    if (localStorage.getItem('state')) {
      this.setState({ ...JSON.parse(localStorage.getItem('state')) });
    } else {
      this.setState({
        stocks: [],
        page: 'home',
        stockId: -1,
        isEditing: false,
      });
    }
    this.render();
    this.setEvent();
  }

  setState(nextState) {
    this.state = nextState;
    localStorage.setItem('state', JSON.stringify(this.state));
    this.render();
  }

  render() {
    if (this.state.page === 'home') {
      this.$target.innerHTML = `
            <div class="topbar">
            <button class="link-button">${
              this.state.isEditing ? '?' : ''
            }</button>
            <span class="spacing"></span>
              <button class="home-edit-button">${
                this.state.isEditing ? '완료' : '편집'
              }</button>
            </div>
            <div class="topbar-transparent"></div>
            <h1>보유 종목</h1>
            <ul class="stock-list">
            ${this.state.stocks
              .sort((a, b) => {
                if (a.id < b.id) return 1;
                else return -1;
              })
              .map((stock) =>
                [
                  `
                <li class="stock-list-item" data-id=${stock.id}>
                <span class="stock-list-item-title" data-id=${stock.id}>${stock.name}</span>
                <div class="spacing"></div>&nbsp;`,

                  this.state.isEditing
                    ? `
                  <button class="delete-stock-button" data-id=${stock.id}>
                  <img src="src/images/delete-button.svg" class="delete-stock-button" data-id=${stock.id}></img>
                  </button>`
                    : `
                    <button class="delete-stock-button blind" data-id=${stock.id}>
                    <img src="src/images/delete-button.svg" class="delete-stock-button blind" data-id=${stock.id}></img>
                    </button>`,
                  `
                </li>
                `,
                ].join('')
              )
              .join('')}
            </ul>
            <div class="bottombar-transparent"></div>
            <div class="bottombar">
            <div class="spacing"></div><button class="home-drawer-button">
                <img src="src/images/pen-and-paper.svg" class="home-drawer-button"></img>
            </button>
            </div>
            <div class="home-drawer">
            <div class="topbar home-drawer__topbar">
            <button class="home-drawer-cancel">취소</button>
            <div class="spacing"></div>
            <button class="add-stock-button">완료</button>
            </div>
            <div class="topbar-transparent"></div>
            <h2 class="question">어떤 종목을 추가할까요?</h2>
            <input type="text" class="stockInput" placeholder="종목명 입력"></input>
            </div>
            `;
    }

    if (this.state.page === 'item') {
      this.$target.innerHTML = `
            <div class="topbar">
                <button class="home-button">< 홈</button>
                <div class="spacing"></div>
            </div>
            <div class="topbar-transparent"></div>
            <h1>${this.getStockById(this.state.stockId).name}</h1>
            <h2>${addCommasToNumber(this.getAverage())} 원/주</h2>
            <h3>매입금액: ${addCommasToNumber(this.getSum())} 원</h3>
            <h3>보유수량: ${addCommasToNumber(this.getTotalCount())} 주</h3>
            <ul>
            ${
              this.getStockById(this.state.stockId).items.length > 0
                ? `<div class="stock-column-title">
                  <span class="column-price">매수가(원)</span>
                  <span class="column-count">수량(개)</span>
                  <span class="column-memo">메모</span>
                  <button class="xbutton" ></button>
                </div>`
                : ''
            }
            ${this.getStockById(this.state.stockId)
              .items.sort((a, b) => {
                if (a.id < b.id) return 1;
                else return -1;
              })
              .map(
                (item) =>
                  `<li class="stock-row">
                        <span class="column-price">${addCommasToNumber(
                          item.price
                        )}</span>
                        <span class="column-count">${addCommasToNumber(
                          item.count
                        )}</span>
                        <input class="date column-memo" data-id=${
                          item.id
                        } value=${item.date}></input>
                        <button class="delete-button xbutton" data-id=${
                          item.id
                        }>✕</button>
                    </li>`
              )
              .join('')}
            </ul>
            <div class="bottombar-transparent"></div>
            <div class="bottombar">
            <div class="spacing"></div><button class="item-drawer-button">
                <img src="src/images/pen-and-paper.svg" class="item-drawer-button"></img>
            </button>
            <div class="item-drawer">
            <div class="topbar item-drawer__topbar">
            <button class="item-drawer-cancel">취소</button>
            <div class="spacing"></div>
            <button class="addButton">완료</button>
            </div>
            <div class="topbar-transparent"></div>
            <h2 class="question">얼마에 매수하셨나요?</h2>
            <div class="input-with-unit">
            <input class="input-with-unit priceInput" placeholder="매수가 입력"></input><span class="unit">원</span>
            </div>
            <h2 class="question">몇 개 매수하셨나요?</h2>
            <div class="input-with-unit">
            <input class="input-with-unit countInput" placeholder="수량 입력"></input><span class="unit">개</span>
            </div>
            </div>
            </div>
            `;
    }
  }

  setEvent() {
    document.addEventListener('click', ({ target }) => {
      if (target.className === 'addButton') {
        const price = document.querySelector('.priceInput').value;
        const count = document.querySelector('.countInput').value;

        if (price && count) {
          document.querySelector('.item-drawer').classList.toggle('open');
          setTimeout(() => {
            const newStock = {
              ...this.getStockById(this.state.stockId),
              items: [
                ...this.getStockById(this.state.stockId).items,
                { id: this.getNewId(), price, count, date: '' },
              ],
            };
            this.setState({
              ...this.state,
              stocks: [
                ...this.state.stocks.filter(
                  (stock) => Number(stock.id) !== Number(this.state.stockId)
                ),
                newStock,
              ],
            });
          }, 300);
        }
      }

      if (target.className.includes('delete-button')) {
        const newStock = {
          ...this.getStockById(this.state.stockId),
          items: [
            ...this.getStockById(this.state.stockId).items.filter(
              (item) => Number(item.id) !== Number(target.dataset.id)
            ),
          ],
        };
        this.setState({
          ...this.state,
          stocks: [
            ...this.state.stocks.filter(
              (stock) => Number(stock.id) !== Number(this.state.stockId)
            ),
            newStock,
          ],
        });
      }

      if (target.className === 'home-edit-button') {
        this.setState({ ...this.state, isEditing: !this.state.isEditing });
      }

      if (target.className === 'home-button') {
        this.navigate('home');
      }

      if (target.className.includes('home-drawer-button')) {
        document.querySelector('.home-drawer').classList.toggle('open');
      }

      if (target.className.includes('home-drawer-cancel')) {
        document.querySelector('.home-drawer').classList.toggle('open');
      }

      if (target.className.includes('item-drawer-cancel')) {
        document.querySelector('.item-drawer').classList.toggle('open');
      }

      if (target.className.includes('item-drawer-button')) {
        document.querySelector('.item-drawer').classList.toggle('open');
      }

      if (
        target.className === 'add-stock-button' &&
        document.querySelector('.stockInput').value.length > 0
      ) {
        document.querySelector('.home-drawer').classList.toggle('open');
        setTimeout(() => {
          this.setState({
            ...this.state,
            stocks: [
              ...this.state.stocks,
              {
                id: this.getNewId(),
                name: document.querySelector('.stockInput').value,
                items: [],
              },
            ],
          });
        }, 300);
      }

      if (
        target.className === 'stock-list-item' ||
        target.className === 'stock-list-item-title' ||
        target.className === 'delete-stock-button blind'
      ) {
        this.setState({ ...this.state, stockId: target.dataset.id });
        this.navigate('item');
      }

      if (target.className === 'delete-stock-button') {
        this.setState({
          ...this.state,
          stocks: this.state.stocks.filter(
            (stock) => Number(stock.id) !== Number(target.dataset.id)
          ),
        });
      }
    });

    document.addEventListener('keyup', ({ key }) => {
      if (
        this.state.page === 'item' &&
        key === 'Enter' &&
        document.querySelector('.priceInput')?.value &&
        document.querySelector('.countInput')?.value
      ) {
        const price = document.querySelector('.priceInput').value;
        const count = document.querySelector('.countInput').value;

        if (price && count) {
          const newStock = {
            ...this.getStockById(this.state.stockId),
            items: [
              ...this.getStockById(this.state.stockId).items,
              { id: this.getNewId(), price, count, date: '' },
            ],
          };
          this.setState({
            ...this.state,
            stocks: [
              ...this.state.stocks.filter(
                (stock) => Number(stock.id) !== Number(this.state.stockId)
              ),
              newStock,
            ],
          });
        }
      }

      if (
        this.state.page === 'home' &&
        key === 'Enter' &&
        document.querySelector('.stockInput').value.length > 0
      ) {
        document.querySelector('.stockInput').blur();
        document.querySelector('.home-drawer').classList.toggle('open');
        setTimeout(() => {
          this.setState({
            ...this.state,
            stocks: [
              ...this.state.stocks,
              {
                id: this.getNewId(),
                name: document.querySelector('.stockInput').value,
                items: [],
              },
            ],
          });
        }, 300);
      }
    });

    document.addEventListener('change', ({ target }) => {
      if (target.className.includes('date')) {
        const newStock = {
          ...this.getStockById(this.state.stockId),
          items: this.getStockById(this.state.stockId).items.map((item) => {
            if (Number(target.dataset.id) === item.id)
              return { ...item, date: target.value };
            else return item;
          }),
        };
        this.setState({
          ...this.state,
          stocks: [
            ...this.state.stocks.filter(
              (stock) => Number(stock.id) !== Number(this.state.stockId)
            ),
            newStock,
          ],
        });
      }
    });

    function startTimer() {
      this.timeoutId = setTimeout(callback, 3000);
    }

    function stopTimer() {
      clearTimeout(this.timeoutId);
    }

    function callback() {
      window.location.href = 'https://firework-gold.vercel.app/';
    }

    const button = document.querySelector('.link-button');

    button.addEventListener('mousedown', startTimer);
    button.addEventListener('touchstart', startTimer);

    button.addEventListener('mouseup', stopTimer);
    button.addEventListener('touchend', stopTimer);
    button.addEventListener('mouseout', stopTimer);
  }

  getSum() {
    if (this.getStockById(this.state.stockId).items.length == 0) return 0;
    else {
      return Math.round(
        this.getStockById(this.state.stockId).items.reduce(
          (acc, item) => acc + item.price * item.count,
          0
        )
      );
    }
  }

  getAverage() {
    if (this.getStockById(this.state.stockId).items.length == 0) return 0;
    else {
      return Math.round(
        this.getStockById(this.state.stockId).items.reduce(
          (acc, item) => acc + item.price * item.count,
          0
        ) /
          this.getStockById(this.state.stockId).items.reduce(
            (acc, item) => acc + Number(item.count),
            0
          )
      );
    }
  }

  getTotalCount() {
    if (this.getStockById(this.state.stockId).items.length == 0) return 0;
    else
      return this.getStockById(this.state.stockId).items.reduce(
        (acc, item) => acc + Number(item.count),
        0
      );
  }

  getNewId() {
    return new Date().getTime();
  }

  navigate(page) {
    this.setState({ ...this.state, page });
  }

  getStockById(id) {
    return this.state.stocks.filter(
      (stock) => Number(stock.id) === Number(id)
    )[0];
  }
}
