const BASE_API = 'https://norma.nomoreparties.space/api';

const INGREDIENTS = {
  FLUOR_BUN: `[data-cy='643d69a5c3f7b9001cfa093d']`,
  CRATER_BUN: `[data-cy='643d69a5c3f7b9001cfa093c']`,
  SAUCE_SPICY: `[data-cy='643d69a5c3f7b9001cfa0942']`,
  RINGS: `[data-cy='643d69a5c3f7b9001cfa0946']`,
  CHEESE: `[data-cy='643d69a5c3f7b9001cfa094a']`,
  SAUCE_SPACE: `[data-cy='643d69a5c3f7b9001cfa0943']`,
  SALAD: `[data-cy='643d69a5c3f7b9001cfa0949']`
};

beforeEach(() => {
  cy.intercept('GET', `${BASE_API}/ingredients`, { fixture: 'ingredients.json' });
  cy.intercept('GET', `${BASE_API}/auth/user`, { fixture: 'user.json' });
  cy.intercept('POST', `${BASE_API}/orders`, { fixture: 'orderResponse.json' });

  cy.visit('/');
  cy.viewport(1280, 900);
  cy.get('#modals').as('modal');
});

describe('Модальные окна', () => {
  it('Открытие модалки по клику', () => {
    cy.get('@modal').should('be.empty');
    cy.get(INGREDIENTS.CHEESE).find('a').click();
    cy.get('@modal').should('not.be.empty');
    cy.get('@modal').within(() => {
      cy.contains('Детали ингредиента');
      cy.contains('Сыр с астероидной плесенью');
      cy.contains('Калории, ккал');
      cy.contains('3377');
      cy.contains('Белки, г');
      cy.contains('84');
      cy.contains('Жиры, г');
      cy.contains('48');
      cy.contains('Углеводы, г');
      cy.contains('420');
    });
  });

  it('Закрытие модалки через Escape', () => {
    cy.get(INGREDIENTS.SAUCE_SPICY).find('a').click();
    cy.get('body').trigger('keydown', { key: 'Escape' });
    cy.get('@modal').should('be.empty');
  });

  it('Закрытие модалки по кнопке', () => {
    cy.get(INGREDIENTS.RINGS).find('a').click();
    cy.get('@modal').find('button').click();
    cy.get('@modal').should('be.empty');
  });

  it('Закрытие модалки по фону', () => {
    cy.get(INGREDIENTS.FLUOR_BUN).find('a').click();
    cy.get(`[data-cy='overlay']`).click({ force: true });
    cy.get('@modal').should('be.empty');
  });

  it('Проверка данных в модалке', () => {
    cy.get(INGREDIENTS.CHEESE).find('a').click();
    cy.get('@modal').within(() => {
      cy.contains('Детали ингредиента');
      cy.contains('Сыр с астероидной плесенью');
      cy.contains('3377');
      cy.contains('84');
    });
  });
});

describe('Конструктор: добавление и замена ингредиентов', () => {
  it('Добавление с увеличением счётчика', () => {
    cy.get(INGREDIENTS.SAUCE_SPICY).find('button').click().click();
    cy.get(INGREDIENTS.SAUCE_SPICY).find('.counter__num').should('contain', '2');
  });

  it('Несколько разных ингредиентов', () => {
    [INGREDIENTS.FLUOR_BUN, INGREDIENTS.SAUCE_SPICY, INGREDIENTS.CHEESE, INGREDIENTS.RINGS].forEach(selector => {
      cy.get(selector).find('button').click();
    });
    cy.get(INGREDIENTS.SAUCE_SPICY).find('.counter__num').should('contain', '1');
  });

  it('Замена булки', () => {
    cy.get(INGREDIENTS.FLUOR_BUN).find('button').click();
    cy.get(INGREDIENTS.CRATER_BUN).find('button').click();
    cy.get(INGREDIENTS.FLUOR_BUN).find('.counter__num').should('not.exist');
    cy.get(INGREDIENTS.CRATER_BUN).find('.counter__num').should('contain', '2');
  });

  it('Булка учитывается дважды в счётчике', () => {
    cy.get(INGREDIENTS.CRATER_BUN).find('button').click();
    cy.get(INGREDIENTS.CRATER_BUN).find('.counter__num').should('contain', '2');
  });

  it('Повторное добавление начинки увеличивает счётчик', () => {
    cy.get(INGREDIENTS.SALAD).find('button').click().click().click();
    cy.get(INGREDIENTS.SALAD).find('.counter__num').should('contain', '3');
  });

  it('Корректное добавление ингредиентов в конструктор', () => {
    // Добавляем булку
    cy.get(INGREDIENTS.FLUOR_BUN).find('button').click();
    // Добавляем начинку и соус
    cy.get(INGREDIENTS.SAUCE_SPICY).find('button').click();
    cy.get(INGREDIENTS.CHEESE).find('button').click();

    // Проверяем, что булка отображается в конструкторе дважды (верх и низ)
    cy.contains('Флюоресцентная булка R2-D3 (верх)').should('exist');
    cy.contains('Флюоресцентная булка R2-D3 (низ)').should('exist');


    // Проверяем, что начинки отображаются в списке конструктора
    cy.contains('Соус Spicy-X').should('exist');
    cy.contains('Сыр с астероидной плесенью').should('exist');
  });
});

describe('Заказ: оформление и доступ', () => {
  beforeEach(() => {
    localStorage.setItem('refreshToken', 'test-token');
    cy.setCookie('accessToken', 'Bearer test-access');
  });

  afterEach(() => {
    localStorage.clear();
    cy.clearCookies();
  });

  it('Оформление заказа с номером', () => {
    [INGREDIENTS.FLUOR_BUN, INGREDIENTS.SAUCE_SPICY, INGREDIENTS.CHEESE].forEach(selector => {
      cy.get(selector).find('button').click();
    });
    cy.get('[data-cy="order-button"]').click();
    cy.get('@modal').find('h2').should('contain', '42187');
  });

  it('Конструктор очищается после заказа', () => {
    cy.get(INGREDIENTS.CRATER_BUN).find('button').click();
    cy.get(INGREDIENTS.RINGS).find('button').click();
    cy.get('[data-cy="order-button"]').click();
    cy.get('@modal').find('button').click();

    // Проверяем количество заглушек через поиск по всему тексту страницы
    cy.get('body').then(($body) => {
      const text = $body.text();
      expect((text.match(/Выберите булки/g) || []).length).to.eq(2);
      expect((text.match(/Выберите начинку/g) || []).length).to.eq(1);
    });
  });

  it('Показывается индикатор оформления', () => {
    cy.intercept('POST', `${BASE_API}/orders`, {
      delay: 1000,
      fixture: 'orderResponse.json',
    });

    cy.get(INGREDIENTS.CRATER_BUN).find('button').click();
    cy.get(INGREDIENTS.SAUCE_SPICY).find('button').click();
    cy.get('[data-cy="order-button"]').click();
    cy.get('@modal').contains('Оформляем заказ');
  });

  it('Кнопка заказа неактивна без булки', () => {
    cy.get(INGREDIENTS.SAUCE_SPICY).find('button').click();
    cy.get('[data-cy="order-button"]').click();
    cy.get('@modal').should('be.empty');
  });
});

describe('Права доступа и навигация', () => {
  it('Редирект на логин без токена', () => {
    cy.intercept('GET', `${BASE_API}/auth/user`, { statusCode: 401 });
    cy.visit('/profile');
    cy.url().should('include', '/login');
  });

  it('Лента доступна без авторизации', () => {
    cy.visit('/feed');
    cy.contains('Лента заказов').should('exist');
  });

  it('Переход по логотипу на главную', () => {
    cy.visit('/feed');
    cy.get('a[href="/"]').first().click();
    cy.location('pathname').should('eq', '/');
  });

  it('Переход между разделами профиля', () => {
    window.localStorage.setItem('refreshToken', 'test-token');
    cy.setCookie('accessToken', 'Bearer test-access');

    cy.intercept('GET', `${BASE_API}/auth/user`).as('getUser');
    cy.visit('/profile');
    cy.wait('@getUser');

    cy.contains('История заказов', { timeout: 10000 }).should('be.visible').click();
    cy.location('pathname').should('include', '/profile/orders');

    cy.contains('Профиль', { timeout: 10000 }).should('be.visible').click();
    cy.location('pathname').should('eq', '/profile');
  });
});
