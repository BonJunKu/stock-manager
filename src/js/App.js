export default class App {
  $target;
  state;

  constructor(target) {
    this.$target = target;
    //items: {id:number, price: number, count: number, date: 'yyyy-mm-dd'}[]
    //stocks: {id: number, name: string, items: {id:number, price: number, count: number, date: 'yyyy-mm-dd'}[]}[]
    this.setState({ stocks: [], page: 'home', stockId: -1 });
    this.render();
    this.setEvent();
  }

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    if (this.state.page === 'home') {
      this.$target.innerHTML = `
            <div class="topbar">
              <button>편집</button>
            </div>
            <h1>보유 종목</h1>
            <input class="stockInput"></input>
            <button class="addStockButton">추가</button>
            <ul>
            ${this.state.stocks
              .sort((a, b) => {
                if (a.id < b.id) return 1;
                else return -1;
              })
              .map(
                (stock) =>
                  `
                <li class="stockListItem" data-id=${stock.id}>
                ${stock.name}&nbsp;<button class="deleteStockButton" data-id=${stock.id}>삭제</button>
                </li>
                `
              )
              .join('')}
            </ul>
            `;
    }

    if (this.state.page === 'item') {
      this.$target.innerHTML = `
            <button class = "homeButton">홈으로</button>
            <h2>${this.getStockById(this.state.stockId).name}</h2>
            <h3>평균매수가: ${this.getAverage()} 원 / 주</h3>
            <h4>총매수금액: ${this.getSum()} 원</h4>
            <h4>총 보유량: ${this.getTotalCount()} 주</h4>
            가격: <input class="priceInput" inputmode="numeric" pattern="[0-9]*"></input> 원<br />
            수량: <input class="countInput" inputmode="numeric" pattern="[0-9]*"></input> 개<br />
            <button class="addButton" data-index = "">입력</button>
            <ul>
            ${this.getStockById(this.state.stockId)
              .items.sort((a, b) => {
                if (a.id < b.id) return 1;
                else return -1;
              })
              .map(
                (item) =>
                  `<li>
                        <span>${item.price}원</span>
                        <span>${item.count}개</span>
                        <input class="date" type="date" data-id=${item.id} value=${item.date}></input>
                        <button class="deleteButton" data-id=${item.id}>삭제</button>
                    </li>`
              )
              .join('')}
            </ul>
            `;
    }
  }

  setEvent() {
    document.addEventListener('click', ({ target }) => {
      if (target.className === 'addButton') {
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

      if (target.className === 'deleteButton') {
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

      if (target.className === 'homeButton') {
        this.navigate('home');
      }

      if (target.className === 'addStockButton') {
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
      }

      if (target.className === 'stockListItem') {
        this.setState({ ...this.state, stockId: target.dataset.id });
        this.navigate('item');
      }

      if (target.className === 'deleteStockButton') {
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
        document.querySelector('.stockInput').value
      ) {
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
      }
    });

    document.addEventListener('change', ({ target }) => {
      if (target.className === 'date') {
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
